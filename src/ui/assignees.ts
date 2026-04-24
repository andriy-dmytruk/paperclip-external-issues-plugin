export interface UpstreamUserReference {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  username?: string;
}

export function formatUpstreamUserLabel(user?: UpstreamUserReference | null): string {
  if (!user) {
    return '';
  }

  return user.displayName || user.emailAddress || user.username || user.accountId;
}

export function formatUpstreamUserSecondary(user?: UpstreamUserReference | null): string {
  if (!user) {
    return '';
  }

  if (user.emailAddress && user.emailAddress !== user.displayName) {
    return user.emailAddress;
  }

  if (user.username && user.username !== user.displayName) {
    return user.username;
  }

  if (user.accountId && user.accountId !== user.displayName) {
    return user.accountId;
  }

  return '';
}

export function sameUpstreamUser(
  left?: UpstreamUserReference | null,
  right?: UpstreamUserReference | null
): boolean {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return left.accountId === right.accountId;
}
