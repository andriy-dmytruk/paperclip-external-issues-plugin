import { createRequire } from 'node:module';
import type { PaperclipPluginManifestV1 } from '@paperclipai/plugin-sdk';

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
  displayName: 'Issue Sync',
  description: 'Synchronize Jira issues into Paperclip projects and sync issue/comment changes both ways.',
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
            type: { type: 'string', enum: ['jira'] },
            name: { type: 'string' },
            jiraBaseUrl: { type: 'string' },
            jiraUserEmail: { type: 'string' },
            jiraToken: { type: 'string' },
            jiraTokenRef: { type: 'string' },
            defaultIssueType: { type: 'string' }
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
  entrypoints: {
    worker: './dist/worker.js',
    ui: './dist/ui/'
  },
  ui: {
    slots: [
      {
        type: 'dashboardWidget',
        id: 'paperclip-jira-plugin-dashboard-widget',
        displayName: 'Issue Sync',
        exportName: 'JiraSyncDashboardWidget'
      },
      {
        type: 'taskDetailView',
        id: 'paperclip-jira-plugin-task-detail-view',
        displayName: 'Issue Sync',
        exportName: 'JiraSyncIssueTaskDetailView',
        entityTypes: ['issue']
      },
      {
        type: 'commentAnnotation',
        id: 'paperclip-jira-plugin-comment-annotation',
        displayName: 'Jira Comment Sync',
        exportName: 'JiraSyncCommentAnnotation',
        entityTypes: ['comment']
      },
      {
        type: 'settingsPage',
        id: 'paperclip-jira-plugin-settings-page',
        displayName: 'Issue Sync',
        exportName: 'JiraSyncSettingsPage'
      }
    ],
    launchers: [
      {
        id: 'paperclip-jira-plugin-global-launcher',
        displayName: 'Sync Issues',
        placementZone: 'globalToolbarButton',
        action: {
          type: 'openModal',
          target: 'JiraSyncLauncherModal'
        },
        render: {
          environment: 'hostOverlay',
          bounds: 'wide'
        }
      },
      {
        id: 'paperclip-jira-plugin-entity-launcher',
        displayName: 'Sync Issues',
        placementZone: 'toolbarButton',
        entityTypes: ['project', 'issue'],
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
