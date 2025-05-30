import React, { useEffect, useRef } from 'react';
import * as vscode from 'vscode';
import { createModelReference } from 'vscode/monaco';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import { useAtom } from 'jotai';
import { createLangiumGlobalConfig } from '@/../tools/common/lspWrapperConfig';
import type { LanguageProps } from './Tools';
import { fmpConfig } from '@/components/Playground/ToolMaps';
import { editorValueAtom, languageAtom } from '@/atoms';
import '@/assets/style/Playground.css';

type LspEditorProps = {
  height: string;
  editorTheme?: string;
};

const wrapper = new MonacoEditorLanguageClientWrapper();

const LspEditor: React.FC<LspEditorProps> = (props) => {
  const [editorValue, setEditorValue] = useAtom(editorValueAtom);
  const [language] = useAtom(languageAtom);
  const editorRef = useRef<any>(null);
  const prevLanguageRef = useRef<LanguageProps | null>(null);

  const getExtensionById = (id: string): string | undefined => {
    const tool = Object.values(fmpConfig.tools).find((tool) => tool.extension.toLowerCase() === id.toLowerCase());
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

      const currentExtension = getExtensionById(language?.id ?? '');
      const uri = vscode.Uri.parse(`/workspace/example.${currentExtension}`);
      const modelRef = await createModelReference(uri, editorValue);
      wrapper.updateEditorModels({
        modelRef,
      });

      editorRef.current = wrapper.getEditor();
      editorRef.current.onDidChangeModelContent(() => {
        handleCodeChange(editorRef.current.getValue());
      });

      const code = localStorage.getItem('editorValue');
      if (code) {
        editorRef.current.setValue(code);
      } else {
        editorRef.current.setValue(editorValue);
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
    if (editorRef.current && language?.id === 'limboole') {
      const code = localStorage.getItem('editorValue');
      if (code) {
        editorRef.current.setValue(code);
      } else {
        editorRef.current.setValue(editorValue);
      }
    }
    prevLanguageRef.current = language ?? null;
  }, [language]);

  const handleCodeChange = (value: string) => {
    setEditorValue(value);
  };

  // const getEditorValue = () => {
  //   if (editorRef.current) {
  //     const value = editorRef.current.getValue();
  //     setEditorValue(value);
  //   }
  // };

  useEffect(() => {
    setEditorValue(editorValue);
  }, [editorValue]);

  useEffect(() => {
    wrapper.updateCodeResources({
      main: {
        text: editorValue,
        fileExt: getExtensionById(language.id) ?? '',
      },
    });
  }, [language]);

  return (
    <div className='custom-code-editor'>
      <div id='monaco-editor-root' style={{ height: props.height }} />
    </div>
  );
};

export default LspEditor;
