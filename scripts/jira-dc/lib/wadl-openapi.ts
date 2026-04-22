import { XMLParser } from 'fast-xml-parser';

export interface ConvertWadlOptions {
  jiraVersion: string;
  sourceUrl?: string;
  serverUrl?: string;
}

type WadlElement = Record<string, unknown>;

interface OpenApiDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string }>;
  paths: Record<string, Record<string, unknown>>;
  tags?: Array<{ name: string }>;
  components: {
    schemas: Record<string, unknown>;
  };
  'x-generated-from-wadl'?: {
    jiraVersion: string;
    sourceUrl?: string;
  };
}

export type { OpenApiDocument };

const XML_PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseTagValue: false,
  trimValues: false,
  preserveOrder: false
});

export function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function getLocalName(key: string): string {
  return key.split(':').pop() ?? key;
}

function isElement(value: unknown): value is WadlElement {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function findChild(node: WadlElement | null | undefined, localName: string): unknown {
  if (!node) {
    return undefined;
  }

  for (const [key, value] of Object.entries(node)) {
    if (getLocalName(key) === localName) {
      return value;
    }
  }

  return undefined;
}

function findChildren(node: WadlElement | null | undefined, localName: string): WadlElement[] {
  return asArray(findChild(node, localName)).filter(isElement);
}

function getStringField(node: WadlElement | null | undefined, fieldName: string): string | undefined {
  const direct = node?.[fieldName];
  if (typeof direct === 'string') {
    return direct;
  }

  const namespaced = findChild(node, fieldName);
  return typeof namespaced === 'string' ? namespaced : undefined;
}

function normalizedPathSegment(value: string | undefined): string {
  if (!value) {
    return '';
  }

  return value.trim().replace(/^\/+|\/+$/g, '');
}

function joinResourcePath(basePath: string, nextPath: string | undefined): string {
  const base = normalizedPathSegment(basePath);
  const next = normalizedPathSegment(nextPath);
  if (!base && !next) {
    return '/';
  }
  if (!base) {
    return `/${next}`;
  }
  if (!next) {
    return `/${base}`;
  }
  return `/${base}/${next}`;
}

function normalizeServerUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/g, '');
  if (!trimmed) {
    return '/rest/api/2';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === 'example.com') {
      return parsed.pathname.replace(/\/+$/g, '') || '/';
    }
  } catch {
    // Keep non-URL values as-is.
  }

  return trimmed;
}

function toOpenApiParameterLocation(style: string | undefined): 'query' | 'path' | 'header' | null {
  switch ((style ?? '').trim().toLowerCase()) {
    case 'query':
      return 'query';
    case 'template':
      return 'path';
    case 'header':
      return 'header';
    default:
      return null;
  }
}

function wadlTypeToSchema(typeName: string | undefined): Record<string, unknown> {
  const normalized = typeName?.split(':').pop()?.toLowerCase();
  switch (normalized) {
    case 'int':
    case 'integer':
    case 'long':
      return { type: 'integer' };
    case 'float':
    case 'double':
    case 'decimal':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'datetime':
      return { type: 'string', format: 'date-time' };
    case 'date':
      return { type: 'string', format: 'date' };
    case 'anyuri':
      return { type: 'string', format: 'uri' };
    case 'base64binary':
      return { type: 'string', format: 'byte' };
    default:
      return { type: 'string' };
  }
}

function ensureOperation(
  document: OpenApiDocument,
  pathName: string,
  methodName: string
): Record<string, unknown> {
  const pathOperations = document.paths[pathName] ?? {};
  const existing = pathOperations[methodName];
  if (existing && typeof existing === 'object') {
    document.paths[pathName] = pathOperations;
    return existing as Record<string, unknown>;
  }

  const created: Record<string, unknown> = {};
  pathOperations[methodName] = created;
  document.paths[pathName] = pathOperations;
  return created;
}

function getTagForPath(pathName: string): string {
  const firstSegment = pathName
    .split('/')
    .map((segment) => segment.trim())
    .find((segment) => segment && !segment.startsWith('{'));
  return firstSegment ?? 'default';
}

function sanitizeOperationId(operationId: string): string {
  return operationId.replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'jiraOperation';
}

function buildResponses(method: WadlElement): Record<string, unknown> {
  const responses: Record<string, unknown> = {};

  for (const response of findChildren(method, 'response')) {
    const statuses = String(getStringField(response, 'status') ?? '200')
      .split(/\s+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
    const representations = findChildren(response, 'representation');

    for (const status of statuses.length > 0 ? statuses : ['200']) {
      const contentEntries: Record<string, unknown> = {};
      for (const representation of representations) {
        const mediaType = String(getStringField(representation, 'mediaType') ?? 'application/json');
        contentEntries[mediaType] = {
          schema: mediaType.includes('json')
            ? { type: 'object', additionalProperties: true }
            : { type: 'string' }
        };
      }

      responses[status] = {
        description: `Response ${status}`,
        ...(Object.keys(contentEntries).length > 0 ? { content: contentEntries } : {})
      };
    }
  }

  if (Object.keys(responses).length === 0) {
    responses.default = {
      description: 'Default response'
    };
  }

  return responses;
}

function buildParameters(method: WadlElement, inherited: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const parameters = [...inherited];
  const requestValue = findChild(method, 'request');
  const request = isElement(requestValue) ? requestValue : null;
  for (const parameter of findChildren(request, 'param')) {
    const location = toOpenApiParameterLocation(getStringField(parameter, 'style'));
    const name = String(getStringField(parameter, 'name') ?? '').trim();
    if (!location || !name) {
      continue;
    }

    parameters.push({
      name,
      in: location,
      required: location === 'path' ? true : String(getStringField(parameter, 'required') ?? '').trim().toLowerCase() === 'true',
      schema: wadlTypeToSchema(getStringField(parameter, 'type')),
      ...(getStringField(parameter, 'default') !== undefined ? { example: String(getStringField(parameter, 'default')) } : {})
    });
  }

  return parameters;
}

function buildRequestBody(method: WadlElement): Record<string, unknown> | undefined {
  const requestValue = findChild(method, 'request');
  const request = isElement(requestValue) ? requestValue : null;
  const representations = findChildren(request, 'representation');
  if (representations.length === 0) {
    return undefined;
  }

  const content: Record<string, unknown> = {};
  for (const representation of representations) {
    const mediaType = String(getStringField(representation, 'mediaType') ?? 'application/json');
    content[mediaType] = {
      schema: mediaType.includes('json')
        ? { type: 'object', additionalProperties: true }
        : { type: 'string' }
    };
  }

  return {
    required: true,
    content
  };
}

function collectResourceOperations(
  document: OpenApiDocument,
  resource: WadlElement,
  inheritedPath: string,
  inheritedParameters: Array<Record<string, unknown>>
): void {
  const currentPath = joinResourcePath(inheritedPath, getStringField(resource, 'path'));
  const resourceParameters = buildParameters(
    {
      request: {
        param: findChild(resource, 'param')
      }
    },
    inheritedParameters
  );

  for (const method of findChildren(resource, 'method')) {
    const methodName = String(getStringField(method, 'name') ?? '').trim().toLowerCase();
    if (!methodName) {
      continue;
    }

    const operation = ensureOperation(document, currentPath, methodName);
    const parameters = buildParameters(method, resourceParameters);
    const requestBody = buildRequestBody(method);
    const tag = getTagForPath(currentPath);
    operation.operationId = sanitizeOperationId(
      String(getStringField(method, 'id') ?? `${methodName}_${currentPath}`)
    );
    operation.tags = [tag];
    operation.responses = buildResponses(method);
    if (parameters.length > 0) {
      operation.parameters = parameters;
    }
    if (requestBody) {
      operation.requestBody = requestBody;
    }
  }

  for (const child of findChildren(resource, 'resource')) {
    collectResourceOperations(document, child, currentPath, resourceParameters);
  }
}

export function convertJiraWadlToOpenApi(
  wadlXml: string,
  options: ConvertWadlOptions
): OpenApiDocument {
  const parsed = XML_PARSER.parse(wadlXml) as WadlElement;
  const applicationValue = findChild(parsed, 'application');
  const application = isElement(applicationValue) ? applicationValue : {};
  const resources = findChildren(application, 'resources');
  const firstResources = resources[0] ?? {};
  const baseUrl = normalizeServerUrl(
    options.serverUrl ?? String(getStringField(firstResources, 'base') ?? '/rest/api/2')
  );

  const document: OpenApiDocument = {
    openapi: '3.0.3',
    info: {
      title: 'Jira Data Center REST API',
      version: options.jiraVersion,
      description: 'Generated from Jira Data Center jira-rest-plugin.wadl.'
    },
    servers: [{ url: baseUrl }],
    paths: {},
    tags: [],
    components: {
      schemas: {}
    },
    'x-generated-from-wadl': {
      jiraVersion: options.jiraVersion,
      ...(options.sourceUrl ? { sourceUrl: options.sourceUrl } : {})
    }
  };

  for (const resourcesEntry of resources) {
    for (const resource of findChildren(resourcesEntry, 'resource')) {
      collectResourceOperations(document, resource, '', []);
    }
  }

  const tagNames = new Set<string>();
  for (const operations of Object.values(document.paths)) {
    for (const operation of Object.values(operations)) {
      if (!operation || typeof operation !== 'object' || !Array.isArray((operation as Record<string, unknown>).tags)) {
        continue;
      }

      for (const tag of (operation as Record<string, unknown>).tags as string[]) {
        tagNames.add(tag);
      }
    }
  }
  document.tags = [...tagNames].sort().map((name) => ({ name }));

  return document;
}
