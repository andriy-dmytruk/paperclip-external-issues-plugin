export interface CleanupCandidate {
  issueId: string;
  title: string;
  jiraIssueKey: string;
  status: string;
}

interface UpstreamCleanupLinkData {
  issueId: string;
  companyId: string;
  projectId?: string;
  source?: string;
  jiraIssueKey: string;
}

interface IssueRecord {
  id: string;
  title: string;
  status: string;
  hidden?: boolean;
  hiddenAt?: string | Date | null;
}

interface CleanupContext {
  entities: {
    list(input: { entityType: string; limit: number }): Promise<Array<{ data: unknown }>>;
  };
  issues: {
    get(issueId: string, companyId: string): Promise<unknown>;
  };
}

function isIssueHidden(issue: IssueRecord): boolean {
  return issue.hidden === true || Boolean(issue.hiddenAt);
}

export async function findCleanupCandidatesForCompany(
  ctx: CleanupContext,
  issueLinkEntityType: string,
  companyId: string,
  projectId?: string
): Promise<CleanupCandidate[]> {
  const issueLinks = await ctx.entities.list({
    entityType: issueLinkEntityType,
    limit: 500
  });
  const scopedLinks = issueLinks
    .map((entry) => entry.data as UpstreamCleanupLinkData)
    .filter((entry) => entry.companyId === companyId && (!projectId || entry.projectId === projectId));
  const candidates: CleanupCandidate[] = [];

  for (const link of scopedLinks) {
    if (link.source !== 'jira') {
      continue;
    }

    const issue = await ctx.issues.get(link.issueId, companyId) as IssueRecord | null;
    if (!issue || isIssueHidden(issue)) {
      continue;
    }

    candidates.push({
      issueId: issue.id,
      title: issue.title,
      jiraIssueKey: link.jiraIssueKey,
      status: issue.status
    });
  }

  return candidates;
}
