/// <reference lib="WebWorker" />

import { start } from './limboole-server-start.js';

declare const self: DedicatedWorkerGlobalScope;

start(self, 'limboole-server');
