import { plainTextToAdf } from './normalize.ts';

export type JiraDescriptionPayload = string | Record<string, unknown>;

export function buildJiraDescriptionPayloads(
  text: string,
  preferredFormat: 'string' | 'adf'
): JiraDescriptionPayload[] {
  const plainText = text ?? '';
  const adf = plainTextToAdf(plainText);
  return preferredFormat === 'string'
    ? [plainText, adf]
    : [adf, plainText];
}

export function shouldRetryWithAlternateJiraDescriptionPayload(error: unknown): boolean {
  return error instanceof Error
    && /description: Operation value must be/i.test(error.message);
}
