import type { PluginToolDeclaration } from '@paperclipai/plugin-sdk';

const paperclipIssueIdProperty = {
  type: 'string',
  description: 'Paperclip issue id used to resolve the linked upstream issue and project-level access policy.'
} as const;

const providerUserReferenceSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['accountId', 'displayName'],
  properties: {
    accountId: {
      type: 'string'
    },
    displayName: {
      type: 'string'
    },
    emailAddress: {
      type: 'string'
    },
    username: {
      type: 'string'
    }
  }
} as const;

export const ISSUE_PROVIDER_AGENT_TOOLS: PluginToolDeclaration[] = [
  {
    name: 'get_upstream_issue',
    displayName: 'Get Upstream Issue',
    description: 'Read the upstream issue linked to a Paperclip issue, including status, assignee, creator, URL, and available upstream status options.',
    parametersSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['paperclipIssueId'],
      properties: {
        paperclipIssueId: paperclipIssueIdProperty
      }
    }
  },
  {
    name: 'list_upstream_comments',
    displayName: 'List Upstream Comments',
    description: 'Read the upstream comments linked to a Paperclip issue so the agent can understand the external conversation.',
    parametersSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['paperclipIssueId'],
      properties: {
        paperclipIssueId: paperclipIssueIdProperty
      }
    }
  },
  {
    name: 'add_upstream_comment',
    displayName: 'Add Upstream Comment',
    description: 'Post a comment to the upstream issue linked to a Paperclip issue.',
    parametersSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['paperclipIssueId', 'body'],
      properties: {
        paperclipIssueId: paperclipIssueIdProperty,
        body: {
          type: 'string',
          minLength: 1,
          description: 'Human-facing comment body to publish upstream.'
        }
      }
    }
  },
  {
    name: 'set_upstream_status',
    displayName: 'Set Upstream Status',
    description: 'Update the upstream issue status for a linked Paperclip issue using one of the provider-supported transition identifiers.',
    parametersSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['paperclipIssueId', 'transitionId'],
      properties: {
        paperclipIssueId: paperclipIssueIdProperty,
        transitionId: {
          type: 'string',
          minLength: 1,
          description: 'Provider-supported status transition or option id returned by get_upstream_issue.'
        }
      }
    }
  },
  {
    name: 'set_upstream_assignee',
    displayName: 'Set Upstream Assignee',
    description: 'Update the upstream assignee for a linked Paperclip issue using a provider user reference, typically chosen from search_upstream_users.',
    parametersSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['paperclipIssueId', 'assignee'],
      properties: {
        paperclipIssueId: paperclipIssueIdProperty,
        assignee: providerUserReferenceSchema
      }
    }
  },
  {
    name: 'search_upstream_users',
    displayName: 'Search Upstream Users',
    description: 'Search users in the selected issue provider context for a Paperclip issue so the agent can choose a valid assignee.',
    parametersSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['paperclipIssueId', 'query'],
      properties: {
        paperclipIssueId: paperclipIssueIdProperty,
        query: {
          type: 'string',
          minLength: 1,
          description: 'Free-text search query for provider users.'
        }
      }
    }
  },
  {
    name: 'create_upstream_issue',
    displayName: 'Create Upstream Issue',
    description: 'Create an upstream issue from a local Paperclip issue when the project is configured for an issue provider.',
    parametersSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['paperclipIssueId'],
      properties: {
        paperclipIssueId: paperclipIssueIdProperty
      }
    }
  }
];

export function getIssueProviderAgentToolDeclaration(name: string): PluginToolDeclaration {
  const declaration = ISSUE_PROVIDER_AGENT_TOOLS.find((entry) => entry.name === name);
  if (!declaration) {
    throw new Error(`Unknown issue provider agent tool declaration: ${name}`);
  }
  return declaration;
}
