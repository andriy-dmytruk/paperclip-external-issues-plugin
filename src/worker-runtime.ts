import { startWorkerRpcHost } from '@paperclipai/plugin-sdk';
import plugin from './worker.ts';

startWorkerRpcHost({ plugin });
