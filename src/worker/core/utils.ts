export function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

export function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .map((entry) => normalizeOptionalString(entry))
        .filter((entry): entry is string => Boolean(entry))
    : [];
}

export function normalizeInputRecord(input: unknown): Record<string, unknown> {
  const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const params = record.params;
  if (!params || typeof params !== 'object') {
    return record;
  }

  return {
    ...record,
    ...(params as Record<string, unknown>)
  };
}

export function normalizeScopeId(value: unknown): string | undefined {
  return normalizeOptionalString(value);
}

export function normalizeProjectName(value: string | undefined): string | undefined {
  return value?.trim().toLowerCase();
}

export function normalizeUpstreamUserReference(value: unknown): UpstreamUserReference | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    return {
      accountId: trimmed,
      displayName: trimmed,
      username: trimmed
    };
  }

  if (typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const accountId =
    normalizeOptionalString(record.accountId)
    ?? normalizeOptionalString(record.name)
    ?? normalizeOptionalString(record.key)
    ?? normalizeOptionalString(record.id);
  const displayName =
    normalizeOptionalString(record.displayName)
    ?? normalizeOptionalString(record.emailAddress)
    ?? normalizeOptionalString(record.name)
    ?? normalizeOptionalString(record.key)
    ?? accountId;

  if (!accountId || !displayName) {
    return undefined;
  }

  return {
    accountId,
    displayName,
    ...(normalizeOptionalString(record.emailAddress) ? { emailAddress: normalizeOptionalString(record.emailAddress) } : {}),
    ...(normalizeOptionalString(record.username) || normalizeOptionalString(record.name) || normalizeOptionalString(record.key)
      ? { username: normalizeOptionalString(record.username) ?? normalizeOptionalString(record.name) ?? normalizeOptionalString(record.key) }
      : {})
  };
}

export function getUpstreamUserDisplayName(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  return normalizeOptionalString(record.displayName)
    ?? normalizeOptionalString(record.emailAddress)
    ?? normalizeOptionalString(record.name)
    ?? normalizeOptionalString(record.key)
    ?? normalizeOptionalString(record.accountId)
    ?? normalizeOptionalString(record.id);
}

export function getUpstreamUserQueryValue(user?: UpstreamUserReference): string | undefined {
  return user?.accountId ?? user?.username;
}
import type { UpstreamUserReference } from './models.ts';
