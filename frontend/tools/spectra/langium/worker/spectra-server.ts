/// <reference lib="WebWorker" />

import { start } from './spectra-server-start.js';

declare const self: DedicatedWorkerGlobalScope;

start(self, 'spectra-server');
