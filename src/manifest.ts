import { createRequire } from 'node:module';
import type { PaperclipPluginManifestV1 } from '@paperclipai/plugin-sdk';
import { ISSUE_PROVIDER_AGENT_TOOLS } from './issue-provider-agent-tools.ts';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json') as { version?: unknown };
const DASHBOARD_WIDGET_CAPABILITY = 'ui.dashboardWidget.register' as unknown as PaperclipPluginManifestV1['capabilities'][number];
const SCHEDULE_TICK_CRON = '* * * * *';
const MANIFEST_VERSION =
  process.env.PLUGIN_VERSION?.trim()
  || (typeof packageJson.version === 'string' && packageJson.version.trim())
  || process.env.npm_package_version?.trim()
  || '0.0.0-dev';

export const manifest: PaperclipPluginManifestV1 = {
  id: 'paperclip-external-issues-plugin',
  apiVersion: 1,
  version: MANIFEST_VERSION,
  displayName: 'External Issue Sync',
  description: 'Synchronize Jira Data Center, Jira Cloud, or GitHub issues into Paperclip.',
  author: 'Andriy Dmytruk',
  categories: ['connector', 'ui'],
  capabilities: [
    DASHBOARD_WIDGET_CAPABILITY,
    'ui.detailTab.register',
    'ui.commentAnnotation.register',
    'ui.action.register',
    'plugin.state.read',
    'plugin.state.write',
    'instance.settings.register',
    'projects.read',
    'issues.read',
    'issues.create',
    'issues.update',
    'agents.read',
    'agent.tools.register',
    'issue.comments.read',
    'issue.comments.create',
    'jobs.schedule',
    'http.outbound',
    'secrets.read-ref'
  ],
  instanceConfigSchema: {
    type: 'object',
    properties: {
      jiraDcProviders: {
        type: 'array',
        title: 'Saved Jira Data Center providers',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['jira_dc'] },
            name: { type: 'string' },
            jiraBaseUrl: { type: 'string' },
            jiraUserEmail: { type: 'string' },
            jiraToken: { type: 'string' },
            jiraTokenRef: { type: 'string' },
            defaultIssueType: { type: 'string' }
          }
        }
      },
      jiraCloudProviders: {
        type: 'array',
        title: 'Saved Jira Cloud providers',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['jira_cloud'] },
            name: { type: 'string' },
            jiraBaseUrl: { type: 'string' },
            jiraUserEmail: { type: 'string' },
            jiraToken: { type: 'string' },
            jiraTokenRef: { type: 'string' },
            defaultIssueType: { type: 'string' }
          }
        }
      },
      githubProviders: {
        type: 'array',
        title: 'Saved GitHub providers',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['github_issues'] },
            name: { type: 'string' },
            githubApiBaseUrl: { type: 'string' },
            githubToken: { type: 'string' },
            githubTokenRef: { type: 'string' },
            defaultRepository: { type: 'string' }
          }
        }
      }
    }
  },
  jobs: [
    {
      jobKey: 'sync.external-issues',
      displayName: 'Sync external issues',
      description: 'Checks for Jira updates and imports/syncs issues on the configured cadence.',
      schedule: SCHEDULE_TICK_CRON
    }
  ],
  tools: ISSUE_PROVIDER_AGENT_TOOLS,
  entrypoints: {
    worker: './dist/worker.js',
    ui: './dist/ui/'
  },
  ui: {
    launchers: [],
    slots: [
      {
        type: 'dashboardWidget',
        id: 'paperclip-external-issues-plugin-dashboard-widget',
        displayName: 'External Issue Sync',
        exportName: 'JiraSyncDashboardWidget'
      },
      {
        type: 'taskDetailView',
        id: 'paperclip-external-issues-plugin-task-detail-view',
        displayName: 'External Issue Sync',
        exportName: 'JiraSyncIssueTaskDetailView',
        entityTypes: ['issue']
      },
      {
        type: 'commentAnnotation',
        id: 'paperclip-external-issues-plugin-comment-annotation',
        displayName: 'External Issue Comment Sync',
        exportName: 'JiraSyncCommentAnnotation',
        entityTypes: ['comment']
      },
      {
        type: 'settingsPage',
        id: 'paperclip-external-issues-plugin-settings-page',
        displayName: 'External Issue Sync',
        exportName: 'JiraSyncSettingsPage'
      },
      {
        type: 'toolbarButton',
        id: 'paperclip-external-issues-plugin-project-sync-toolbar-button',
        displayName: 'External Issue Sync',
        exportName: 'JiraSyncEntityToolbarButton',
        entityTypes: ['project']
      }
    ]
  }
};

export default manifest;
