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
  displayName: 'Jira Sync',
  description: 'Synchronize Jira issues into Paperclip projects and sync issue/comment changes both ways.',
  author: 'Álvaro Sánchez-Mariscal',
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
      jiraBaseUrl: {
        type: 'string',
        title: 'Jira Base URL'
      },
      jiraUserEmail: {
        type: 'string',
        title: 'Jira User Email'
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
        displayName: 'Jira Sync',
        exportName: 'JiraSyncDashboardWidget'
      },
      {
        type: 'taskDetailView',
        id: 'paperclip-jira-plugin-task-detail-view',
        displayName: 'Jira Sync',
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
        type: 'globalToolbarButton',
        id: 'paperclip-jira-plugin-global-toolbar-button',
        displayName: 'Jira Sync',
        exportName: 'JiraSyncGlobalToolbarButton'
      },
      {
        type: 'toolbarButton',
        id: 'paperclip-jira-plugin-toolbar-button',
        displayName: 'Jira Sync',
        exportName: 'JiraSyncEntityToolbarButton',
        entityTypes: ['project', 'issue']
      },
      {
        type: 'settingsPage',
        id: 'paperclip-jira-plugin-settings-page',
        displayName: 'Jira Sync',
        exportName: 'JiraSyncSettingsPage'
      }
    ]
  }
};

export default manifest;
