import { definePlugin, runWorker } from '@paperclipai/plugin-sdk';

export interface AgentCompanySummary {
  id: string;
  name: string;
  status: 'active' | 'draft';
}

const seedCompanies: AgentCompanySummary[] = [
  {
    id: 'acme-ops',
    name: 'Acme Ops',
    status: 'active'
  },
  {
    id: 'research-lab',
    name: 'Research Lab',
    status: 'draft'
  }
];

export async function listAgentCompanies(): Promise<AgentCompanySummary[]> {
  return seedCompanies;
}

const plugin = definePlugin({
  async setup() {
    // Minimal worker bootstrap so Paperclip can initialize the plugin process.
  }
});

export default plugin;
runWorker(plugin, import.meta.url);
