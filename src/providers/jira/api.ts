import { ApiApi as JiraApiClient } from '../../../generated/jira-dc-client/9.12.0/apis/ApiApi.ts';
import {
  Configuration as JiraApiConfiguration,
  FetchError as JiraFetchError,
  querystring as jiraApiQuerystring,
  ResponseError as JiraResponseError
} from '../../../generated/jira-dc-client/9.12.0/runtime.ts';

export interface JiraRuntimeConfig {
  providerId: string;
  providerName: string;
  baseUrl?: string;
  userEmail?: string;
  token?: string;
}

interface JiraApiContext {
  http: {
    fetch(input: string, init?: RequestInit): Promise<Response>;
  };
  logger: {
    error(message: string, metadata?: Record<string, unknown>): void;
  };
}

function encodeBasicAuth(userEmail: string, token: string): string {
  return Buffer.from(`${userEmail}:${token}`, 'utf8').toString('base64');
}

function getJiraApi(ctx: JiraApiContext, config: JiraRuntimeConfig): JiraApiClient {
  if (!config.baseUrl || !config.token) {
    throw new Error('Jira is not configured. Set jiraBaseUrl and jiraTokenRef.');
  }

  const authorization = getJiraAuthorization(config);

  return new JiraApiClient(new JiraApiConfiguration({
    basePath: `${config.baseUrl}/rest`,
    fetchApi: async (input: RequestInfo | URL, init?: RequestInit) => await ctx.http.fetch(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url,
      init
    ),
    queryParamsStringify: (params) => jiraApiQuerystring(params).replace(/%2C/g, ','),
    headers: {
      Accept: 'application/json',
      Authorization: authorization
    }
  }));
}

function getJiraAuthorization(config: JiraRuntimeConfig): string {
  return config.userEmail
    ? `Basic ${encodeBasicAuth(config.userEmail, config.token ?? '')}`
    : `Bearer ${config.token ?? ''}`;
}

async function normalizeJiraApiError(error: unknown): Promise<Error> {
  if (error instanceof JiraResponseError) {
    let responseText = '';
    try {
      responseText = await error.response.text();
    } catch {
      responseText = '';
    }

    let detail = responseText || error.response.statusText;
    try {
      const parsed = responseText ? JSON.parse(responseText) as Record<string, unknown> : null;
      if (parsed) {
        const errorMessages = Array.isArray(parsed.errorMessages)
          ? parsed.errorMessages.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
          : [];
        const fieldErrors = parsed.errors && typeof parsed.errors === 'object'
          ? Object.entries(parsed.errors as Record<string, unknown>)
              .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
              .map(([field, value]) => `${field}: ${String(value)}`)
          : [];
        const combined = [...errorMessages, ...fieldErrors].join(' ');
        if (combined) {
          detail = combined;
        }
      }
    } catch {
      // Keep raw response text if Jira response isn't JSON.
    }

    return new Error(`Jira request failed (${error.response.status}). ${detail}`);
  }

  if (error instanceof JiraFetchError) {
    return error.cause instanceof Error
      ? error.cause
      : new Error('Jira request failed.');
  }

  return error instanceof Error ? error : new Error('Jira request failed.');
}

function isNoContentBridgeError(error: unknown): boolean {
  return error instanceof Error
    && error.message.includes('Invalid response status code 204');
}

export async function jiraApiCall<T>(
  ctx: JiraApiContext,
  config: JiraRuntimeConfig,
  run: (api: JiraApiClient) => Promise<T>
): Promise<T> {
  try {
    return await run(getJiraApi(ctx, config));
  } catch (error) {
    const normalizedError = await normalizeJiraApiError(error);
    ctx.logger.error('Jira API call failed.', {
      providerId: config.providerId,
      baseUrl: config.baseUrl,
      message: normalizedError.message
    });
    throw normalizedError;
  }
}

export async function jiraApiCallAllowNoContent(
  ctx: JiraApiContext,
  config: JiraRuntimeConfig,
  run: (api: JiraApiClient) => Promise<unknown>
): Promise<void> {
  try {
    await jiraApiCall(ctx, config, run);
  } catch (error) {
    if (isNoContentBridgeError(error)) {
      return;
    }

    throw error;
  }
}

export async function jiraFetchJson<T>(
  ctx: JiraApiContext,
  config: JiraRuntimeConfig,
  path: string
): Promise<T> {
  if (!config.baseUrl || !config.token) {
    throw new Error('Jira is not configured. Set jiraBaseUrl and jiraTokenRef.');
  }

  const response = await ctx.http.fetch(
    `${config.baseUrl}/rest${path.startsWith('/') ? path : `/${path}`}`,
    {
      headers: {
        Accept: 'application/json',
        Authorization: getJiraAuthorization(config)
      }
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Jira request failed (${response.status}). ${text || response.statusText}`.trim());
  }

  return await response.json() as T;
}
