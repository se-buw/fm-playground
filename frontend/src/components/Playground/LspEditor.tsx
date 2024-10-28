import React, { useEffect, useRef } from 'react';
import * as vscode from 'vscode';
import { createModelReference } from 'vscode/monaco';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createLangiumGlobalConfig } from '../../assets/languages/lspWrapperConfig';
import '../../assets/style/Playground.css'
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import type { LanguageProps } from './Tools';
import fmpConfig from '../../../fmp.config';

type LspEditorProps = {
  height: string;
  setEditorValue: (value: string) => void;
  editorValue: string;
  language: LanguageProps;
  setLanguage?: (value: string) => void;
  lineToHighlight?: number;
  setLineToHighlight?: (value: number) => void;
  editorTheme?: string;
};

const wrapper = new MonacoEditorLanguageClientWrapper();

const LspEditor: React.FC<LspEditorProps> = (props) => {
  const editorRef = useRef<any>(null);
  const prevLanguageRef = useRef<LanguageProps | null>(null);

  const getExtensionById = (id: string): string | undefined => {
    const tool = Object.values(fmpConfig.tools).find(tool => tool.extension.toLowerCase() === id.toLowerCase());
    return tool?.extension;
  };

  useEffect(() => {
    const startEditor = async () => {
      if (wrapper.isStarted()) {
        alert('Editor already started');
        return;
      }

      const langiumGlobalConfig = await createLangiumGlobalConfig();
      await wrapper.initAndStart(langiumGlobalConfig, document.getElementById('monaco-editor-root'));

      const currentExtension = getExtensionById(props.language?.id ?? '');
      const uri = vscode.Uri.parse(`/workspace/example.${currentExtension}`);
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

  useEffect(() => {
    setEditorValue(props.editorValue);
  }, [props.editorValue]);

  const setEditorValue = (value: string) => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        const selection = editorRef.current.getSelection();
        editorRef.current.setValue(value);
        if (selection) {
          editorRef.current.setSelection(selection);
        }
      }
    }
  };


  useEffect(() => {
    wrapper.updateCodeResources({
      main: {
        text: props.editorValue,
        fileExt: getExtensionById(props.language.id) ?? ''
      }
    });
  }, [props.language]);

  return (
    <div className="custom-code-editor">
      <div
        id="monaco-editor-root"
        style={{ height: props.height }}
      />
    </div>
  )
}



export default LspEditor