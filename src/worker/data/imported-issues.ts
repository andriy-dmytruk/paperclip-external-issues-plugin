interface LinkedIssueData {
  projectId?: string;
  companyId?: string;
  source?: string;
}

export async function countImportedIssuesByProject(
  ctx: { entities: { list(input: { entityType: string; limit: number }): Promise<Array<{ data: unknown }>> } },
  issueLinkEntityType: string,
  companyId?: string
): Promise<Record<string, number>> {
  const issueLinks = await ctx.entities.list({
    entityType: issueLinkEntityType,
    limit: 500
  });
  const counts: Record<string, number> = {};
  for (const entry of issueLinks) {
    const data = entry.data as LinkedIssueData;
    if (!data.projectId || data.source !== 'jira') {
      continue;
    }
    if (companyId && data.companyId !== companyId) {
      continue;
    }
    counts[data.projectId] = (counts[data.projectId] ?? 0) + 1;
  }
  return counts;
}
