import React, { useEffect, useRef } from 'react';
import * as vscode from 'vscode';
import { createModelReference } from 'vscode/monaco';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageclient/browser.js';
import { createLangiumGlobalConfig } from '../../assets/languages/limboole/config/wrapperLimbooleConfig.js';
import workerPortUrl from '../../assets/languages/limboole/worker/limboole-server-port?worker&url';
import '../../assets/style/Playground.css'
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import type { LanguageProps } from './Tools';


type LimbooleEditorProps = {
  height: string;
  setEditorValue: (value: string) => void;
  editorValue: string;
  language?: LanguageProps;
  setLanguage?: (value: string) => void;
  lineToHighlight?: number;
  setLineToHighlight?: (value: number) => void;
  editorTheme?: string;
};

const wrapper = new MonacoEditorLanguageClientWrapper();

const LimbooleEditor: React.FC<LimbooleEditorProps> = (props) => {
  const editorRef = useRef<any>(null);
  const prevLanguageRef = useRef<LanguageProps | null>(null);

  useEffect(() => {
    const startEditor = async () => {
      if (wrapper.isStarted()) {
        alert('Editor already started');
        return;
      }

      const limbooleWorkerPort = loadLimbooleWorkerPort();
      // limbooleWorkerPort.onmessage = (event) => {
      //   console.log('Received message from worker:', event.data);
      // };

      const channel = new MessageChannel();
      limbooleWorkerPort.postMessage({ port: channel.port2 }, [channel.port2]);

      const reader = new BrowserMessageReader(channel.port1);
      const writer = new BrowserMessageWriter(channel.port1);
      // reader.listen((message) => {
      //   console.log('Received message from worker:', message);
      // });

      const langiumGlobalConfig = await createLangiumGlobalConfig({
        languageServerId: 'first',
        useLanguageClient: true,
        worker: limbooleWorkerPort,
        messagePort: channel.port1,
        messageTransports: { reader, writer }
      });
      await wrapper.initAndStart(langiumGlobalConfig, document.getElementById('monaco-editor-root'));

      const uri = vscode.Uri.parse('/workspace/example.limboole');
      const modelRef = await createModelReference(uri, props.editorValue);
      wrapper.updateEditorModels({
        modelRef
      });

      editorRef.current = wrapper.getEditor();
      editorRef.current.onDidChangeModelContent(() => {
        handleCodeChange(editorRef.current.getValue());
      });

      const code = localStorage.getItem('editorValue');
      if (code) {
        editorRef.current.setValue(code);
      } else {
        editorRef.current.setValue(props.editorValue);
      }
    };

    const disposeEditor = async () => {
      wrapper.reportStatus();
      await wrapper.dispose();
    };

    startEditor();

    return () => {
      disposeEditor();
    };

  }, []);

  useEffect(() => {
    editorRef.current = wrapper.getEditor();
    if (editorRef.current && props.language?.id === 'limboole') {

      const code = localStorage.getItem('editorValue');
      if (code) {
        editorRef.current.setValue(code);
      } else {
        editorRef.current.setValue(props.editorValue);
      }
    }
    prevLanguageRef.current = props.language ?? null;
  }, [props.language]);

  const handleCodeChange = (value: string) => {
    props.setEditorValue(value);
  };

  const getEditorValue = () => {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      props.setEditorValue(value);
    }
  };

  const setEditorValue = (value: string) => {
    if (editorRef.current) {
      editorRef.current.setValue(value);
    }
  };

  return (
    <div className="custom-code-editor">
      <div
        id="monaco-editor-root"
        style={{ height: props.height }}
      />
    </div>
  )
}

export const loadLimbooleWorkerPort = () => {
  return new Worker(workerPortUrl, {
    type: 'module',
    name: 'Limboole Server Port',
  });
};

export default LimbooleEditor