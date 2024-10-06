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
    console.log('Received message from worker:', event.data);
  };

  const channel = new MessageChannel();
  limbooleWorkerPort.postMessage({ port: channel.port2 }, [channel.port2]);

  const reader = new BrowserMessageReader(channel.port1);
  const writer = new BrowserMessageWriter(channel.port1);
  reader.listen((message) => {
    console.log('Received message from worker:', message);
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

  // const langiumGlobalConfig2 = await createLangiumGlobalConfig({
  //   languageServerId: 'second',
  //   useLanguageClient: false,
  //   text: textMod
  // });

  // await wrapper2.initAndStart(langiumGlobalConfig2, document.getElementById('monaco-editor-root2'));
  // vscode.commands.getCommands().then((x) => {
  //   console.log('Currently registered # of vscode commands: ' + x.length);
  // });
};

const disposeEditor = async () => {
  wrapper.reportStatus();
  await wrapper.dispose();
  console.log(wrapper.reportStatus().join('\n'));

  wrapper2.reportStatus();
  await wrapper2.dispose();
  console.log(wrapper2.reportStatus().join('\n'));
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
  // Language Server preparation
  console.log(`Langium worker URL: ${workerUrl}`);
  return new Worker(workerUrl, {
      type: 'module',
      name: 'Limboole Server Regular',
  });
};

export const loadLimbooleWorkerPort = () => {
  // Language Server preparation
  console.log(`Langium worker URL: ${workerPortUrl}`);
  return new Worker(workerPortUrl, {
      type: 'module',
      name: 'Limboole Server Port',
  });
};