export type GitHubIssueStateReason = 'completed' | 'not_planned' | 'duplicate' | 'reopened';

export function normalizeGitHubStateReason(value: string | null | undefined): GitHubIssueStateReason | undefined {
  if (!value) {
    return undefined;
  }

  switch (value.trim().toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'not_planned':
    case 'not planned':
      return 'not_planned';
    case 'duplicate':
      return 'duplicate';
    case 'reopened':
      return 'reopened';
    default:
      return undefined;
  }
}

export function getGitHubStatusName(
  state: string | null | undefined,
  stateReason: string | null | undefined
): string {
  if (String(state).toLowerCase() !== 'closed') {
    return 'Open';
  }

  switch (normalizeGitHubStateReason(stateReason)) {
    case 'completed':
      return 'Completed';
    case 'not_planned':
      return 'Not planned';
    case 'duplicate':
      return 'Duplicate';
    case 'reopened':
      return 'Reopened';
    default:
      return 'Closed';
  }
}

export function getGitHubStatusCategory(
  state: string | null | undefined,
  stateReason: string | null | undefined
): string {
  if (String(state).toLowerCase() !== 'closed') {
    return 'Open';
  }

  return normalizeGitHubStateReason(stateReason) === 'not_planned' ? 'Cancelled' : 'Done';
}

export function parseGitHubTransition(
  transitionId: string
): { state: 'open' | 'closed'; stateReason?: Exclude<GitHubIssueStateReason, 'reopened'> } {
  const normalized = transitionId.trim().toLowerCase();
  if (normalized === 'closed' || normalized === 'completed' || normalized === 'closed:completed') {
    return { state: 'closed', stateReason: 'completed' };
  }
  if (normalized === 'not_planned' || normalized === 'not planned' || normalized === 'closed:not_planned') {
    return { state: 'closed', stateReason: 'not_planned' };
  }
  if (normalized === 'duplicate' || normalized === 'closed:duplicate') {
    return { state: 'closed', stateReason: 'duplicate' };
  }
  return { state: 'open' };
}
