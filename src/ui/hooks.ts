import { useEffect, useState } from 'react';
import { usePluginAction, usePluginToast } from '@paperclipai/plugin-sdk/ui';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayMs, value]);

  return debounced;
}

export function useActionRunner<TParams extends Record<string, unknown>>(actionKey: string) {
  const action = usePluginAction(actionKey);
  const toast = usePluginToast();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'default' | 'success' | 'error'>('default');

  async function run(params: TParams) {
    try {
      setBusy(true);
      setMessage(null);
      const result = await action(params) as { message?: string };
      const nextMessage = result?.message ?? 'Done.';
      setMessage(nextMessage);
      setTone('success');
      toast({
        title: 'External Issue Sync',
        body: nextMessage,
        tone: 'success'
      });
      return result;
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : 'Action failed.';
      setMessage(nextMessage);
      setTone('error');
      toast({
        title: 'External Issue Sync',
        body: nextMessage,
        tone: 'error'
      });
      return null;
    } finally {
      setBusy(false);
    }
  }

  return {
    run,
    busy,
    message,
    tone
  };
}
