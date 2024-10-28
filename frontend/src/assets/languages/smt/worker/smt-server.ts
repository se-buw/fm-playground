/// <reference lib="WebWorker" />

import { start } from './smt-server-start.js';

declare const self: DedicatedWorkerGlobalScope;

start(self, 'smt-server');
