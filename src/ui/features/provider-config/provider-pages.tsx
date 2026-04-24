import React from 'react';
import { DEFAULT_JIRA_ISSUE_TYPE, JIRA_ISSUE_TYPE_OPTIONS, type JiraProviderConfig, type ProviderType } from '../../plugin-config.js';
import { isGitHubProviderType, isJiraProviderType } from '../../../providers/shared/config.ts';

type AnyRecord = Record<string, any>;

type ProviderDirectoryProps = {
  providerDirectory: AnyRecord | null | undefined;
  selectedProviderId: string;
  newProviderType: ProviderType;
  sectionCardStyle: () => React.CSSProperties;
  stackStyle: (gap?: number) => React.CSSProperties;
  rowStyle: () => React.CSSProperties;
  buttonStyle: (tone?: 'primary' | 'secondary' | 'success') => React.CSSProperties;
  pageCardStyle: (selected?: boolean) => React.CSSProperties;
  neutralBadgeStyle: () => React.CSSProperties;
  healthBadgeStyle: (status?: string) => React.CSSProperties;
  buttonLabel: (icon: any, label: string) => React.JSX.Element;
  providerLabel: (providerType?: ProviderType | string | null, label?: string | null) => React.JSX.Element;
  getProviderTypeLabel: (providerType?: ProviderType | string | null) => string;
  formatProviderHealthLabel: (status?: string, fallback?: string) => string;
  shouldShowProviderHealthMessage: (status?: string | null) => boolean;
  buildProviderDetailNavigationTarget: (providerId: string) => string;
  createEmptyProviderDraft: (type?: ProviderType) => JiraProviderConfig;
  setProviderDraft: React.Dispatch<React.SetStateAction<JiraProviderConfig | null>>;
  setProviderDraftToken: React.Dispatch<React.SetStateAction<string>>;
  setSelectedProviderDetailId: React.Dispatch<React.SetStateAction<string | null>>;
  openProviderDetailPage: (providerId?: string) => void;
};

export function ProviderDirectorySection(props: ProviderDirectoryProps): React.JSX.Element {
  return (
    <div style={props.stackStyle(12)}>
      <div style={props.sectionCardStyle()}>
        <div style={props.stackStyle(12)}>
          <div style={props.rowStyle()}>
            <div style={{ fontSize: 13, opacity: 0.8, flex: '1 1 240px' }}>
              Providers are reusable connections. Choose one to review it, or create a new one.
            </div>
            <button
              type="button"
              style={props.buttonStyle('primary')}
              onClick={() => {
                props.setProviderDraft(props.createEmptyProviderDraft(props.newProviderType));
                props.setProviderDraftToken('');
                props.setSelectedProviderDetailId(null);
                props.openProviderDetailPage();
              }}
            >
              {props.buttonLabel('add', 'Create provider')}
            </button>
          </div>
        </div>
      </div>

      {(props.providerDirectory?.providers ?? []).length === 0 ? (
        <div style={props.sectionCardStyle()}>
          No providers saved yet. Add one here, then attach it from an individual project page.
        </div>
      ) : (props.providerDirectory?.providers ?? []).map((provider: AnyRecord) => (
        <button
          key={provider.providerId}
          type="button"
          style={props.pageCardStyle(provider.providerId === props.selectedProviderId)}
          onClick={() => props.openProviderDetailPage(provider.providerId)}
          data-navigation-target={props.buildProviderDetailNavigationTarget(provider.providerId)}
        >
          <div style={props.rowStyle()}>
            <strong>{provider.displayName}</strong>
            <span style={props.neutralBadgeStyle()}>{props.providerLabel(provider.providerType, props.getProviderTypeLabel(provider.providerType))}</span>
            <span style={props.healthBadgeStyle(provider.status)}>
              {props.formatProviderHealthLabel(provider.status, provider.healthLabel)}
            </span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            {props.shouldShowProviderHealthMessage(provider.status) && provider.healthMessage
              ? provider.healthMessage
              : provider.configSummary || 'Open to review connection details.'}
          </div>
        </button>
      ))}
    </div>
  );
}

type ProviderDetailProps = {
  providerDraft: JiraProviderConfig;
  providerDraftToken: string;
  providerDetailData: AnyRecord | null | undefined;
  providerDirectoryData: AnyRecord | null | undefined;
  newProviderType: ProviderType;
  companyId: string;
  configSaving: boolean;
  testConnectionBusy: boolean;
  setProviderDraft: React.Dispatch<React.SetStateAction<JiraProviderConfig | null>>;
  setProviderDraftToken: React.Dispatch<React.SetStateAction<string>>;
  setNewProviderType: React.Dispatch<React.SetStateAction<ProviderType>>;
  createEmptyProviderDraft: (type?: ProviderType) => JiraProviderConfig;
  buttonStyle: (tone?: 'primary' | 'secondary' | 'success') => React.CSSProperties;
  stackStyle: (gap?: number) => React.CSSProperties;
  rowStyle: () => React.CSSProperties;
  inputStyle: () => React.CSSProperties;
  sectionCardStyle: () => React.CSSProperties;
  neutralBadgeStyle: () => React.CSSProperties;
  healthBadgeStyle: (status?: string) => React.CSSProperties;
  buttonLabel: (icon: any, label: string) => React.JSX.Element;
  providerLabel: (providerType?: ProviderType | string | null, label?: string | null) => React.JSX.Element;
  getProviderTypeLabel: (providerType?: ProviderType | string | null) => string;
  formatProviderHealthLabel: (status?: string, fallback?: string) => string;
  onTestConnection: (input: {
    companyId: string;
    providerId?: string;
    providerKey?: ProviderType;
    config: AnyRecord;
  }) => void;
  onSaveProvider: () => void;
  onDeleteProvider: () => void;
};

export function ProviderDetailSection(props: ProviderDetailProps): React.JSX.Element {
  return (
    <div style={props.sectionCardStyle()}>
      <div style={props.stackStyle(12)}>
        <div style={props.rowStyle()}>
          <strong>{props.providerDetailData?.mode === 'edit' ? 'Edit provider' : 'Create provider'}</strong>
          <span style={props.neutralBadgeStyle()}>{props.providerLabel(props.providerDraft.type, props.getProviderTypeLabel(props.providerDraft.type))}</span>
          <span style={props.healthBadgeStyle(props.providerDetailData?.healthStatus)}>
            {props.formatProviderHealthLabel(props.providerDetailData?.healthStatus)}
          </span>
        </div>
        {props.providerDetailData?.healthMessage ? (
          <div style={{ fontSize: 12, opacity: 0.74 }}>
            {props.providerDetailData.healthMessage}
          </div>
        ) : null}
        <label style={props.stackStyle(6)}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Provider type</span>
          <select
            style={props.inputStyle()}
            value={props.providerDraft.type}
            onChange={(event) => {
              const nextType = event.target.value as ProviderType;
              props.setNewProviderType(nextType);
              props.setProviderDraft((current) => current ? {
                ...current,
                type: nextType,
                ...(isGitHubProviderType(nextType)
                  ? {
                      githubApiBaseUrl: current.githubApiBaseUrl ?? 'https://api.github.com',
                      defaultRepository: current.defaultRepository ?? '',
                      jiraBaseUrl: undefined,
                      jiraUserEmail: undefined
                    }
                  : {
                      jiraBaseUrl: current.jiraBaseUrl ?? '',
                      jiraUserEmail: current.jiraUserEmail ?? '',
                      defaultIssueType: current.defaultIssueType ?? DEFAULT_JIRA_ISSUE_TYPE,
                      githubApiBaseUrl: undefined,
                      defaultRepository: undefined
                    })
              } : props.createEmptyProviderDraft(nextType));
            }}
          >
            {(props.providerDetailData?.availableProviderTypes ?? props.providerDirectoryData?.availableProviderTypes ?? []).map((option: AnyRecord) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label style={props.stackStyle(6)}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Provider name</span>
          <input
            style={props.inputStyle()}
            value={props.providerDraft.name}
            placeholder="Oracle Jira"
            onChange={(event) => props.setProviderDraft((current) => current ? {
              ...current,
              name: event.target.value
            } : null)}
          />
        </label>
        {isJiraProviderType(props.providerDraft.type) ? (
          <>
            <label style={props.stackStyle(6)}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Jira base URL</span>
              <input
                style={props.inputStyle()}
                value={props.providerDraft.jiraBaseUrl ?? ''}
                placeholder="https://jira.example.com"
                onChange={(event) => props.setProviderDraft((current) => current ? {
                  ...current,
                  jiraBaseUrl: event.target.value
                } : null)}
              />
            </label>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Use only the Jira host. Project keys belong on project mappings, not on the provider record.
            </div>
            <label style={props.stackStyle(6)}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Jira user email</span>
              <input
                style={props.inputStyle()}
                value={props.providerDraft.jiraUserEmail ?? ''}
                placeholder="Optional for Basic auth Jira setups"
                onChange={(event) => props.setProviderDraft((current) => current ? {
                  ...current,
                  jiraUserEmail: event.target.value
                } : null)}
              />
            </label>
            <label style={props.stackStyle(6)}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Default issue type</span>
              <select
                style={props.inputStyle()}
                value={props.providerDraft.defaultIssueType ?? DEFAULT_JIRA_ISSUE_TYPE}
                onChange={(event) => props.setProviderDraft((current) => current ? {
                  ...current,
                  defaultIssueType: event.target.value
                } : null)}
              >
                {JIRA_ISSUE_TYPE_OPTIONS.map((issueType) => (
                  <option key={issueType} value={issueType}>{issueType}</option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <label style={props.stackStyle(6)}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>GitHub API base URL</span>
              <input
                style={props.inputStyle()}
                value={props.providerDraft.githubApiBaseUrl ?? ''}
                placeholder="https://api.github.com"
                onChange={(event) => props.setProviderDraft((current) => current ? {
                  ...current,
                  githubApiBaseUrl: event.target.value
                } : null)}
              />
            </label>
            <label style={props.stackStyle(6)}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Default repository</span>
              <input
                style={props.inputStyle()}
                value={props.providerDraft.defaultRepository ?? ''}
                placeholder="owner/repo"
                onChange={(event) => props.setProviderDraft((current) => current ? {
                  ...current,
                  defaultRepository: event.target.value
                } : null)}
              />
            </label>
          </>
        )}
        <label style={props.stackStyle(6)}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {isJiraProviderType(props.providerDraft.type) ? 'Jira API token' : 'GitHub Personal Access Token'}
          </span>
          <input
            style={props.inputStyle()}
            type="password"
            value={props.providerDraftToken}
            placeholder={
              props.providerDetailData?.tokenSaved
                ? '********'
                : (isJiraProviderType(props.providerDraft.type) ? 'Paste Jira API token' : 'Paste GitHub Personal Access Token')
            }
            onChange={(event) => props.setProviderDraftToken(event.target.value)}
          />
        </label>
        {props.providerDetailData?.tokenSaved ? (
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Leave the token field unchanged to keep the current token. Enter a new value only to replace it.
          </div>
        ) : null}
        {!isJiraProviderType(props.providerDraft.type) ? (
          <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.45 }}>
            Use a GitHub Personal Access Token. Fine-grained tokens should grant issue write access for the selected repository.
            {' '}
            <a
              href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'inherit' }}
            >
              Learn about GitHub personal access tokens
            </a>
            .
          </div>
        ) : null}
        <div style={props.rowStyle()}>
          <button
            type="button"
            style={props.buttonStyle('secondary')}
            disabled={props.testConnectionBusy}
            onClick={() => props.onTestConnection({
              companyId: props.companyId,
              providerId: props.providerDraft.id,
              providerKey: props.providerDraft.type,
              config: isJiraProviderType(props.providerDraft.type)
                ? {
                    ...props.providerDraft,
                    jiraBaseUrl: props.providerDraft.jiraBaseUrl?.trim() || undefined,
                    jiraUserEmail: props.providerDraft.jiraUserEmail?.trim() || undefined,
                    defaultIssueType: props.providerDraft.defaultIssueType?.trim() || DEFAULT_JIRA_ISSUE_TYPE,
                    ...(props.providerDraftToken.trim() ? { jiraToken: props.providerDraftToken.trim() } : {})
                  }
                : {
                    ...props.providerDraft,
                    githubApiBaseUrl: props.providerDraft.githubApiBaseUrl?.trim() || undefined,
                    defaultRepository: props.providerDraft.defaultRepository?.trim() || undefined,
                    ...(props.providerDraftToken.trim() ? { githubToken: props.providerDraftToken.trim() } : {})
                  }
            })}
          >
            {props.buttonLabel('sync', props.testConnectionBusy ? 'Testing…' : 'Test connection')}
          </button>
          <button
            type="button"
            style={props.buttonStyle('primary')}
            disabled={props.configSaving}
            onClick={props.onSaveProvider}
          >
            {props.buttonLabel('save', props.configSaving ? 'Saving…' : 'Save provider')}
          </button>
          {props.providerDetailData?.mode === 'edit' ? (
            <button
              type="button"
              style={props.buttonStyle()}
              onClick={props.onDeleteProvider}
            >
              {props.buttonLabel('close', 'Remove provider')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
