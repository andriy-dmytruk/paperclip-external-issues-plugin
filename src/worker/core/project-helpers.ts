import { parseRepositoryReference } from '../../providers/github-issues/repository.ts';
import { normalizeOptionalString, normalizeProjectName } from './utils.ts';

interface ProjectLike {
  id: string;
  name: string;
  archivedAt?: unknown;
}

interface ProjectsContext {
  projects: {
    list(input: { companyId: string }): Promise<ProjectLike[]>;
  };
}

interface MappingLike {
  paperclipProjectId?: string;
  paperclipProjectName?: string;
}

export function getProjectGitHubRepository(project: unknown): string | undefined {
  if (!project || typeof project !== 'object') {
    return undefined;
  }

  const record = project as Record<string, unknown>;
  const workspaces = Array.isArray(record.workspaces) ? record.workspaces : [];
  const primaryWorkspace =
    record.primaryWorkspace && typeof record.primaryWorkspace === 'object'
      ? record.primaryWorkspace as Record<string, unknown>
      : null;
  const codebase =
    record.codebase && typeof record.codebase === 'object'
      ? record.codebase as Record<string, unknown>
      : null;
  const git =
    record.git && typeof record.git === 'object'
      ? record.git as Record<string, unknown>
      : null;

  const repoCandidates = [
    git?.repository,
    primaryWorkspace?.repoUrl,
    ...workspaces
      .filter((workspace): workspace is Record<string, unknown> => Boolean(workspace && typeof workspace === 'object'))
      .sort((left, right) => Number(Boolean(right.isPrimary)) - Number(Boolean(left.isPrimary)))
      .map((workspace) => workspace.repoUrl),
    codebase?.repoUrl
  ];

  for (const candidate of repoCandidates) {
    const normalized = normalizeOptionalString(candidate);
    const parsed = normalized ? parseRepositoryReference(normalized) : null;
    if (parsed) {
      return `${parsed.owner}/${parsed.repo}`;
    }
  }

  return undefined;
}

export async function findProjectById(
  ctx: ProjectsContext,
  companyId: string,
  projectId: string | undefined
): Promise<{ id: string; name: string } | null> {
  if (!projectId) {
    return null;
  }

  const projects = await ctx.projects.list({ companyId });
  const project = projects.find((entry) => entry.id === projectId && !entry.archivedAt);
  return project ? { id: project.id, name: project.name } : null;
}

export async function findActiveProject(
  ctx: ProjectsContext,
  companyId: string,
  projectId?: string,
  projectName?: string
): Promise<ProjectLike | null> {
  const projects = (await ctx.projects.list({ companyId })).filter((project) => !project.archivedAt);
  if (projectId) {
    return projects.find((project) => project.id === projectId) ?? null;
  }
  const normalizedProjectName = normalizeProjectName(projectName);
  if (!normalizedProjectName) {
    return null;
  }
  return projects.find((project) => normalizeProjectName(project.name) === normalizedProjectName) ?? null;
}

export async function findProjectGitHubRepository(
  ctx: ProjectsContext,
  companyId: string,
  projectId?: string,
  projectName?: string
): Promise<string | undefined> {
  const project = await findActiveProject(ctx, companyId, projectId, projectName);
  return project ? getProjectGitHubRepository(project) : undefined;
}

export async function resolvePaperclipProjectForMapping(
  ctx: ProjectsContext,
  companyId: string,
  mapping: MappingLike
): Promise<{ id: string; name: string } | null> {
  const project = await findActiveProject(ctx, companyId, mapping.paperclipProjectId, mapping.paperclipProjectName);
  return project ? { id: project.id, name: project.name } : null;
}

export function mappingMatchesProject(mapping: MappingLike, project: { id: string; name: string } | null): boolean {
  if (!project) {
    return false;
  }

  if (mapping.paperclipProjectId && mapping.paperclipProjectId === project.id) {
    return true;
  }

  return normalizeProjectName(mapping.paperclipProjectName) === normalizeProjectName(project.name);
}
