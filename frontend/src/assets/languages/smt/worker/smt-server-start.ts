/// <reference lib="WebWorker" />

import { EmptyFileSystem } from 'langium';
import { startLanguageServer } from 'langium/lsp';
import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser.js';
import { createSmtServices } from '../ls/smt-module.js';

export let messageReader: BrowserMessageReader | undefined;
export let messageWriter: BrowserMessageWriter | undefined;

export const start = (port: MessagePort | DedicatedWorkerGlobalScope, name: string) => {
    console.log(`Starting ${name}...`);
    /* browser specific setup code */
    messageReader = new BrowserMessageReader(port);
    messageWriter = new BrowserMessageWriter(port);

    const connection = createConnection(messageReader, messageWriter);

    // Inject the shared services and language-specific services
    const { shared } = createSmtServices({ connection, ...EmptyFileSystem });

    // Start the language server with the shared services
    startLanguageServer(shared);
};
