/// <reference lib="WebWorker" />

import { start, messageReader } from './smt-server-start.js';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent) => {
    const data = event.data;
    console.log(event.data);
    if (data.port !== undefined) {
        start(data.port, 'smt-server-port');

        messageReader?.listen((message) => {
            console.log('Received message from main thread:', message);
        });

        setTimeout(() => {
            // test independent communication
            self.postMessage('started');
        }, 1000);
    }
};