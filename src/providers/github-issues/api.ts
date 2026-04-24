import { Octokit } from '@octokit/rest';
import type { GitHubProviderRuntimeConfig as GitHubConfig } from '../../worker/providers/config-resolver.ts';

interface GitHubApiContext {
  http: {
    fetch(input: string, init?: RequestInit): Promise<Response>;
  };
  logger: {
    error(message: string, metadata?: Record<string, unknown>): void;
  };
}

function getGitHubApi(ctx: GitHubApiContext, config: GitHubConfig): Octokit {
  if (!config.token) {
    throw new Error('GitHub is not configured. Set githubTokenRef.');
  }

  return new Octokit({
    auth: config.token,
    baseUrl: config.apiBaseUrl,
    request: {
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => await ctx.http.fetch(
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url,
        init
      )
    }
  });
}

function extractGitHubErrorDetail(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const message = typeof record.message === 'string' ? record.message.trim() : '';
  const errors = Array.isArray(record.errors)
    ? record.errors
        .flatMap((entry) => {
          if (!entry || typeof entry !== 'object') {
            return [];
          }
          const errorRecord = entry as Record<string, unknown>;
          const entryMessage = typeof errorRecord.message === 'string' ? errorRecord.message.trim() : '';
          const code = typeof errorRecord.code === 'string' ? errorRecord.code.trim() : '';
          const field = typeof errorRecord.field === 'string' ? errorRecord.field.trim() : '';
          return [field, code, entryMessage].filter(Boolean).join(': ');
        })
        .filter((entry) => entry.length > 0)
    : [];

  return [message, ...errors].filter(Boolean).join(' ').trim() || undefined;
}

async function normalizeGitHubApiError(error: unknown): Promise<Error> {
  if (error && typeof error === 'object') {
    const status = typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : undefined;
    const response = (error as { response?: { data?: unknown } }).response;
    const detail = extractGitHubErrorDetail(response?.data)
      ?? (error instanceof Error ? error.message.trim() : '');

    if (status) {
      const hint =
        status === 401
          ? 'Check that the GitHub Personal Access Token is valid and has not expired.'
          : status === 403
            ? 'Check that the GitHub Personal Access Token can write issues for this repository.'
            : status === 404
              ? 'Check that the repository exists and that the GitHub Personal Access Token can access it.'
              : status === 422
                ? 'GitHub can return this when the selected assignee cannot be assigned to this repository or when the issue update payload is invalid.'
                : '';
      const suffix = [detail, hint].filter(Boolean).join(' ');
      return new Error(`GitHub request failed (${status}). ${suffix}`.trim());
    }
  }

  return error instanceof Error ? error : new Error('GitHub request failed.');
}

export async function githubApiCall<T>(
  ctx: GitHubApiContext,
  config: GitHubConfig,
  run: (api: Octokit) => Promise<T>
): Promise<T> {
  try {
    return await run(getGitHubApi(ctx, config));
  } catch (error) {
    const normalizedError = await normalizeGitHubApiError(error);
    ctx.logger.error('GitHub API call failed.', {
      providerId: config.providerId,
      baseUrl: config.apiBaseUrl,
      message: normalizedError.message
    });
    throw normalizedError;
  }
}
