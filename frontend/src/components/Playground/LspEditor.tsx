import React, { useEffect, useRef, useState } from 'react';
import * as vscode from 'vscode';
import { createModelReference } from 'vscode/monaco';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { createLangiumGlobalConfig } from '@/../tools/common/lspWrapperConfig';
import '../../assets/style/Playground.css';
import '@codingame/monaco-vscode-theme-defaults-default-extension';
import type { LanguageProps } from './Tools';
import { fmpConfig } from '@/ToolMaps';
import * as monaco from 'monaco-editor';

type LspEditorProps = {
    height: string;
    setEditorValue: (value: string) => void;
    editorValue: string;
    language: LanguageProps;
    setLanguage?: (value: string) => void;
    lineToHighlight: number[];
    setLineToHighlight: (line: number[]) => void;
    editorTheme?: string;
};

// Create wrapper instance only when needed
let wrapperInstance: MonacoEditorLanguageClientWrapper | null = null;

const LspEditor: React.FC<LspEditorProps> = (props) => {
    const editorRef = useRef<any>(null);
    const prevLanguageRef = useRef<LanguageProps | null>(null);
    const isInitializedRef = useRef<boolean>(false);
    const [decorationIds, setDecorationIds] = useState<string[]>([]);

    const getExtensionById = (id: string): string | undefined => {
        const tool = Object.values(fmpConfig.tools).find((tool) => tool.extension.toLowerCase() === id.toLowerCase());
        return tool?.extension;
    };
    const handleCodeChange = (value: string) => {
        props.setEditorValue(value);
        props.setLineToHighlight([]);
    };

    useEffect(() => {
        // Don't initialize if language is not set yet
        if (!props.language?.id) {
            return;
        }

        // Initialize wrapper if not already done
        if (!wrapperInstance) {
            wrapperInstance = new MonacoEditorLanguageClientWrapper();
        }

        const startEditor = async () => {
            if (wrapperInstance?.isStarted()) {
                console.warn('Editor already started, disposing first...');
                await wrapperInstance.dispose();
                isInitializedRef.current = false;
            }

            if (!isInitializedRef.current) {
                const langiumGlobalConfig = await createLangiumGlobalConfig();
                await wrapperInstance!.initAndStart(langiumGlobalConfig, document.getElementById('monaco-editor-root'));

                const currentExtension = getExtensionById(props.language?.id ?? '');
                const uri = vscode.Uri.parse(`/workspace/example.${currentExtension}`);
                const modelRef = await createModelReference(uri, props.editorValue);
                wrapperInstance!.updateEditorModels({
                    modelRef,
                });

                editorRef.current = wrapperInstance!.getEditor();
                editorRef.current.onDidChangeModelContent(() => {
                    handleCodeChange(editorRef.current.getValue());
                });

                const code = localStorage.getItem('editorValue');
                if (code) {
                    editorRef.current.setValue(code);
                } else {
                    editorRef.current.setValue(props.editorValue);
                }

                isInitializedRef.current = true;
                prevLanguageRef.current = props.language;
            }
        };

        startEditor();

        return () => {
            // Clean up on unmount
            if (wrapperInstance?.isStarted()) {
                wrapperInstance.dispose();
                wrapperInstance = null;
                isInitializedRef.current = false;
            }
        };
    }, [props.language?.id]); // Only depend on language ID for initialization

    useEffect(() => {
        // Only update if editor is initialized and language has changed
        if (!isInitializedRef.current || !editorRef.current || !props.language?.id || !wrapperInstance) {
            return;
        }

        // Check if language actually changed
        if (prevLanguageRef.current?.id === props.language.id) {
            return;
        }

        // Update the code resources for the new language
        wrapperInstance.updateCodeResources({
            main: {
                text: props.editorValue,
                fileExt: getExtensionById(props.language.id) ?? '',
            },
        });

        // Update the model reference with new language extension
        const updateModel = async () => {
            const currentExtension = getExtensionById(props.language.id);
            const uri = vscode.Uri.parse(`/workspace/example.${currentExtension}`);
            const modelRef = await createModelReference(uri, props.editorValue);
            wrapperInstance!.updateEditorModels({
                modelRef,
            });
        };

        updateModel();
        prevLanguageRef.current = props.language;
    }, [props.language?.id]);
    useEffect(() => {
        if (isInitializedRef.current && editorRef.current) {
            setEditorValue(props.editorValue);
        }
    }, [props.editorValue]);

    // Line highlighting effect - similar to Editor.tsx
    useEffect(() => {
        if (editorRef.current) {
            const editor = editorRef.current;
            if (props.lineToHighlight !== null && props.lineToHighlight.length > 0) {
                const decorations = props.lineToHighlight.map((line) => {
                    return {
                        range: new monaco.Range(line, 1, line, 1),
                        options: {
                            isWholeLine: true,
                            className: 'lineHighlight',
                            glyphMarginClassName: 'lineHighlightGlyph',
                        },
                    };
                });
                const newDecorationIds = editor.deltaDecorations(decorationIds, decorations);
                setDecorationIds(newDecorationIds);
            } else {
                // Remove all decorations
                const newDecorationIds = editor.deltaDecorations(decorationIds, []);
                setDecorationIds(newDecorationIds);
            }
        }
    }, [props.lineToHighlight]);

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

    // const getEditorValue = () => {
    //   if (editorRef.current) {
    //     const value = editorRef.current.getValue();
    //     props.setEditorValue(value);
    //   }
    // };

    return (
        <div className='custom-code-editor'>
            <div id='monaco-editor-root' style={{ height: props.height }} />
        </div>
    );
};

export default LspEditor;
