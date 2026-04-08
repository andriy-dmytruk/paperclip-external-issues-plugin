const companies = [
  { name: 'Acme Ops', status: 'active' },
  { name: 'Research Lab', status: 'draft' }
] as const;

export function AgentCompaniesManagerPage(): string {
  const items = companies
    .map((company) => `- ${company.name} (${company.status})`)
    .join('\n');

  return [
    '# Agent Companies Manager',
    '',
    'Scaffolded plugin UI placeholder.',
    '',
    '## Seed companies',
    items
  ].join('\n');
}
