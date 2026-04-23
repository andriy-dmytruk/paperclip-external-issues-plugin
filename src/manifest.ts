import { createRequire } from 'node:module';
import type { PaperclipPluginManifestV1 } from '@paperclipai/plugin-sdk';
import { PROVIDER_TYPE_OPTIONS } from './providers/shared/types.ts';
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
  id: 'paperclip-jira-plugin',
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
      providers: {
        type: 'array',
        title: 'Saved issue providers',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['jira', ...PROVIDER_TYPE_OPTIONS] },
            name: { type: 'string' },
            jiraBaseUrl: { type: 'string' },
            jiraUserEmail: { type: 'string' },
            jiraToken: { type: 'string' },
            jiraTokenRef: { type: 'string' },
            defaultIssueType: { type: 'string' },
            githubApiBaseUrl: { type: 'string' },
            githubToken: { type: 'string' },
            githubTokenRef: { type: 'string' },
            defaultRepository: { type: 'string' }
          }
        }
      },
      jiraBaseUrl: {
        type: 'string',
        title: 'Jira Base URL'
      },
      jiraUserEmail: {
        type: 'string',
        title: 'Jira User Email'
      },
      jiraToken: {
        type: 'string',
        title: 'Jira API Token',
        description: 'Optional inline Jira API token for local provider configuration.'
      },
      jiraTokenRef: {
        type: 'string',
        title: 'Jira API Token Secret Ref'
      },
      defaultIssueType: {
        type: 'string',
        title: 'Default Jira Issue Type'
      }
    }
  },
  jobs: [
    {
      jobKey: 'sync.jira-issues',
      displayName: 'Sync Jira issues',
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
    slots: [
      {
        type: 'dashboardWidget',
        id: 'paperclip-jira-plugin-dashboard-widget',
        displayName: 'External Issue Sync',
        exportName: 'JiraSyncDashboardWidget'
      },
      {
        type: 'taskDetailView',
        id: 'paperclip-jira-plugin-task-detail-view',
        displayName: 'External Issue Sync',
        exportName: 'JiraSyncIssueTaskDetailView',
        entityTypes: ['issue']
      },
      {
        type: 'commentAnnotation',
        id: 'paperclip-jira-plugin-comment-annotation',
        displayName: 'External Issue Comment Sync',
        exportName: 'JiraSyncCommentAnnotation',
        entityTypes: ['comment']
      },
      {
        type: 'settingsPage',
        id: 'paperclip-jira-plugin-settings-page',
        displayName: 'External Issue Sync',
        exportName: 'JiraSyncSettingsPage'
      }
    ],
    launchers: [
      {
        id: 'paperclip-jira-plugin-entity-launcher',
        displayName: 'External Issue Sync',
        placementZone: 'toolbarButton',
        entityTypes: ['project'],
        action: {
          type: 'openModal',
          target: 'JiraSyncLauncherModal'
        },
        render: {
          environment: 'hostOverlay',
          bounds: 'wide'
        }
      }
    ]
  }
};

export default manifest;
