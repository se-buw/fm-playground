/// <reference lib="WebWorker" />

import { start} from './limboole-server-start.js';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent) => {
  const data = event.data;
  console.log(event.data);
  if (data.port !== undefined) {
    start(data.port, 'limboole-server-port');

    setTimeout(() => {
      self.postMessage('started');
    }, 1000);
  }
};
