export const manifest = {
  id: 'agent-companies-manager',
  apiVersion: 1,
  version: '0.1.0',
  displayName: 'Agent Companies Manager',
  description: 'A Paperclip plugin scaffold for managing agent companies.',
  author: 'Alvaro Sanchez',
  categories: ['workspace'],
  capabilities: ['ui.page.register'],
  entrypoints: {
    worker: './dist/worker.js',
    ui: './dist/ui/'
  }
} as const;

export default manifest;
