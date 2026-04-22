import { strict as assert } from 'node:assert';
import test from 'node:test';

import { convertJiraWadlToOpenApi } from '../scripts/jira-dc/lib/wadl-openapi.ts';

const SAMPLE_WADL = `<?xml version="1.0" encoding="UTF-8"?>
<application xmlns="http://wadl.dev.java.net/2009/02">
  <resources base="https://jira.example.com/rest/api/2">
    <resource path="issue/{issueIdOrKey}">
      <param name="issueIdOrKey" style="template" type="xs:string" required="true" xmlns:xs="http://www.w3.org/2001/XMLSchema"/>
      <method name="GET" id="getIssue">
        <request>
          <param name="fields" style="query" type="xs:string" xmlns:xs="http://www.w3.org/2001/XMLSchema"/>
        </request>
        <response status="200">
          <representation mediaType="application/json"/>
        </response>
      </method>
      <resource path="comment">
        <method name="POST" id="addComment">
          <request>
            <representation mediaType="application/json"/>
          </request>
          <response status="201">
            <representation mediaType="application/json"/>
          </response>
        </method>
      </resource>
    </resource>
  </resources>
</application>`;

const NAMESPACED_WADL = `<?xml version="1.0" encoding="UTF-8"?>
<ns2:application xmlns:ns2="http://wadl.dev.java.net/2009/02">
  <ns2:resources base="http://example.com:8080/jira/rest/">
    <ns2:resource path="api/2/project">
      <ns2:method name="GET" id="getProjects">
        <ns2:response status="200">
          <ns2:representation mediaType="application/json"/>
        </ns2:response>
      </ns2:method>
      <ns2:resource path="{projectIdOrKey}">
        <ns2:param name="projectIdOrKey" style="template" type="xs:string" required="true" xmlns:xs="http://www.w3.org/2001/XMLSchema"/>
        <ns2:resource path="statuses">
          <ns2:method name="GET" id="getProjectStatuses">
            <ns2:request>
              <ns2:param name="expand" style="query" type="xs:string" xmlns:xs="http://www.w3.org/2001/XMLSchema"/>
            </ns2:request>
            <ns2:response status="200">
              <ns2:representation mediaType="application/json"/>
            </ns2:response>
          </ns2:method>
        </ns2:resource>
      </ns2:resource>
    </ns2:resource>
  </ns2:resources>
</ns2:application>`;

test('convertJiraWadlToOpenApi maps Jira DC WADL resources into OpenAPI paths and operations', () => {
  const document = convertJiraWadlToOpenApi(SAMPLE_WADL, {
    jiraVersion: '9.12.0',
    sourceUrl: 'https://docs.atlassian.com/jira/REST/9.12.0/jira-rest-plugin.wadl'
  });

  assert.equal(document.openapi, '3.0.3');
  assert.equal(document.info.version, '9.12.0');
  assert.equal(document.servers[0]?.url, 'https://jira.example.com/rest/api/2');
  assert.ok(document.paths['/issue/{issueIdOrKey}']);
  assert.ok(document.paths['/issue/{issueIdOrKey}/comment']);

  const getIssue = document.paths['/issue/{issueIdOrKey}']?.get as Record<string, unknown>;
  assert.equal(getIssue.operationId, 'getIssue');
  assert.deepEqual(getIssue.tags, ['issue']);
  assert.ok(Array.isArray(getIssue.parameters));
  assert.deepEqual(
    (getIssue.parameters as Array<Record<string, unknown>>).map((parameter) => ({
      name: parameter.name,
      in: parameter.in,
      required: parameter.required
    })),
    [
      { name: 'issueIdOrKey', in: 'path', required: true },
      { name: 'fields', in: 'query', required: false }
    ]
  );

  const addComment = document.paths['/issue/{issueIdOrKey}/comment']?.post as Record<string, unknown>;
  assert.equal(addComment.operationId, 'addComment');
  assert.ok(addComment.requestBody);
  assert.ok((addComment.responses as Record<string, unknown>)['201']);
});

test('convertJiraWadlToOpenApi handles Jira DC namespace-prefixed WADL documents', () => {
  const document = convertJiraWadlToOpenApi(NAMESPACED_WADL, {
    jiraVersion: '9.12.0'
  });

  assert.equal(document.servers[0]?.url, '/jira/rest');
  assert.ok(document.paths['/api/2/project']);
  assert.ok(document.paths['/api/2/project/{projectIdOrKey}/statuses']);
  assert.deepEqual(document.tags, [{ name: 'api' }]);

  const getProjectStatuses = document.paths['/api/2/project/{projectIdOrKey}/statuses']?.get as Record<string, unknown>;
  assert.equal(getProjectStatuses.operationId, 'getProjectStatuses');
  assert.deepEqual(
    (getProjectStatuses.parameters as Array<Record<string, unknown>>).map((parameter) => ({
      name: parameter.name,
      in: parameter.in,
      required: parameter.required
    })),
    [
      { name: 'projectIdOrKey', in: 'path', required: true },
      { name: 'expand', in: 'query', required: false }
    ]
  );
});
