import type { PaperclipIssueStatus } from './models.ts';
import { DEFAULT_JIRA_ISSUE_TYPE } from '../../providers/shared/config.ts';

export const SETTINGS_SCOPE = {
  scopeKind: 'instance' as const,
  stateKey: 'paperclip-external-issues-plugin-settings'
};

export const ISSUE_LINK_ENTITY_TYPE = 'paperclip-external-issues-plugin.issue-link';
export const HIDDEN_ISSUE_MARKER_PREFIX = '<!-- paperclip-external-issues-plugin-upstream: ';
export const HIDDEN_ISSUE_MARKER_SUFFIX = ' -->';
export const COMMENT_LINKS_STATE_KEY = 'paperclip-external-issues-plugin-comment-links';

export const DEFAULT_SYNC_FREQUENCY_MINUTES = 15;
export const DEFAULT_ISSUE_TYPE = DEFAULT_JIRA_ISSUE_TYPE;
export const DEFAULT_PROVIDER_ID = 'provider-default-jira';
export const DEFAULT_CONNECTION_TEST_KEY = '__default__';
export const DEFAULT_PAPERCLIP_STATUS: PaperclipIssueStatus = 'todo';
