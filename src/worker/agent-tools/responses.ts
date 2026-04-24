export function buildToolContent(title: string, lines: string[]): string {
  return [title, ...lines.filter(Boolean)].join('\n');
}

export function buildToolSuccess<TData>(data: TData, content: string): { data: TData; content: string } {
  return { data, content };
}

export function buildToolError(error: unknown): { error: string } {
  return {
    error: error instanceof Error ? error.message : 'Tool execution failed.'
  };
}
