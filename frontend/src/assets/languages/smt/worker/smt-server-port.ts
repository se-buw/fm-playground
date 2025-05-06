/// <reference lib="WebWorker" />

import { start } from './smt-server-start.js';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent) => {
    const data = event.data;
    if (data.port !== undefined) {
        start(data.port, 'smt-server-port');

        setTimeout(() => {
            self.postMessage('started');
        }, 1000);
    }
};
