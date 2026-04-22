export function getRequiredFlag(flagName: string): string {
  const value = getOptionalFlag(flagName);
  if (!value) {
    throw new Error(`Missing required flag: ${flagName}`);
  }
  return value;
}

export function getOptionalFlag(flagName: string): string | undefined {
  const index = process.argv.indexOf(flagName);
  if (index === -1) {
    return undefined;
  }

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Flag ${flagName} requires a value.`);
  }
  return value;
}
