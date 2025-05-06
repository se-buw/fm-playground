// FIXME: This file is not used in the current implementation. It is kept for future reference.

import * as vscode from 'vscode';
import { createModelReference } from 'vscode/monaco';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageclient/browser.js';
import { createLangiumGlobalConfig } from './config/wrapperLimbooleConfig.js';
import workerUrl from './worker/limboole-server?worker&url';
import workerPortUrl from './worker/limboole-server-port?worker&url';
import text from './content/example.limboole?raw';

const wrapper = new MonacoEditorLanguageClientWrapper();
const wrapper2 = new MonacoEditorLanguageClientWrapper();

const startEditor = async () => {
  if (wrapper.isStarted() && wrapper2.isStarted()) {
    alert('Editor already started');
    return;
  }

  const limbooleWorkerPort = loadLimbooleWorkerPort();
  limbooleWorkerPort.onmessage = (event) => {
  };

  const channel = new MessageChannel();
  limbooleWorkerPort.postMessage({ port: channel.port2 }, [channel.port2]);

  const reader = new BrowserMessageReader(channel.port1);
  const writer = new BrowserMessageWriter(channel.port1);
  reader.listen((message) => {
  });

  const langiumGlobalConfig = await createLangiumGlobalConfig({
    languageServerId: 'first',
    useLanguageClient: true,
    worker: limbooleWorkerPort,
    messagePort: channel.port1,
    messageTransports: { reader, writer }
  });
  await wrapper.initAndStart(langiumGlobalConfig, document.getElementById('monaco-editor-root'));

  const uri = vscode.Uri.parse('/workspace/example-mod.limboole');
  const modelRef = await createModelReference(uri, text);
  wrapper.updateEditorModels({
    modelRef
  })
};

const disposeEditor = async () => {
  wrapper.reportStatus();
  await wrapper.dispose();

  wrapper2.reportStatus();
  await wrapper2.dispose();
};

export const runLimbooleWrapper = async () => {
  try {
    document.querySelector('#button-start')?.addEventListener('click', startEditor);
    document.querySelector('#button-dispose')?.addEventListener('click', disposeEditor);
  } catch (e) {
    console.error(e);
  }
};

export const loadLimbooleWorkerRegular = () => {
  return new Worker(workerUrl, {
    type: 'module',
    name: 'Limboole Server Regular',
  });
};

export const loadLimbooleWorkerPort = () => {
  return new Worker(workerPortUrl, {
    type: 'module',
    name: 'Limboole Server Port',
  });
};