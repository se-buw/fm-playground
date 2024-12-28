import { useState, useRef, useEffect } from 'react'
import Editor from "@monaco-editor/react";
import '../../assets/style/Playground.css'
import * as monacoEditor from 'monaco-editor';
import { useAtom } from 'jotai';
import { editorValueAtom, languageAtom, lineToHighlightAtom } from '@/atoms';
import { fmpConfig, languageConfigMap } from '@/components/Playground/ToolMaps';

interface BasicCodeEditorProps {
  height: string;
  editorTheme: string;
}

const CodeEditor: React.FC<BasicCodeEditorProps> = (props: BasicCodeEditorProps) => {
  const [editorValue, setEditorValue] = useAtom(editorValueAtom);
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null); // editor reference
  const [language, setLanguage] = useAtom(languageAtom);
  const [lineToHighlight, setLineToHighlight] = useAtom(lineToHighlightAtom);
  const [decorationIds, setDecorationIds] = useState<string[]>([]);

  /**
  * Sets the editor value when the editorValue prop changes.
  */
  useEffect(() => {
    setEditorValue(editorValue);
  }, [editorValue]);

  /**
   * Sets the language when the language prop changes.
  */
  useEffect(() => {
    setLanguage(language);
  }, [language.id]);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      if (lineToHighlight !== null && lineToHighlight.length > 0) {
        const decorations = lineToHighlight.map(line => {
          return {
            range: new window.monaco.Range(line, 1, line, 1),
            options: {
              isWholeLine: true,
              className: 'lineHighlight',
              glyphMarginClassName: 'lineHighlightGlyph'
            }
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
  }, [lineToHighlight]);

  /**
   * Handles the editor did mount event. On mount, registers all the languages. 
   * Languages and their configurations are defined in the assets/languages folder.
   * @see assets/languages
   * @param {*} editor // editor reference
   * @param {*} monaco  
   * @todo Add autocomplete for the languages (monaco.languages.registerCompletionItemProvider)
   */
  function handleEditorDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) {
    editorRef.current = editor
    editorRef.current.focus()

    const tools: { [key: string]: { name: string; extension: string; shortName: string; } } = fmpConfig.tools;
    for (const toolKey in tools) {
      const tool = tools[toolKey as keyof typeof tools];
      const languageId = tool.extension.replace(/^\./, '');
      const resource = languageConfigMap[languageId];
      if(!resource) {
        console.warn(`Language configuration for ${languageId} not found.`);
        continue;
      }
      const { tokenProvider, configuration } = resource;
      monaco.languages.register({ id: languageId });
      monaco.languages.setMonarchTokensProvider(languageId, tokenProvider);
      monaco.languages.setLanguageConfiguration(languageId, configuration);
    }

    monaco.editor.defineTheme('spectraTheme', {
      base: props.editorTheme === 'vs-dark' ? 'vs-dark' : 'vs', // 'vs-dark' or 'vs'
      inherit: true, // inherit the base theme
      rules: [
        { token: 'system', foreground: '189BCC', fontStyle: 'bold' },
        { token: 'environment', foreground: '0CD806', fontStyle: 'bold' },
        { token: 'reg', foreground: 'FF00FF' },

      ],
      colors: {},
    });

    monaco.editor.setTheme('spectraTheme');
  }

  useEffect(() => {
    if (editorRef.current) {
      handleEditorDidMount(editorRef.current, window.monaco)
    }
  }, [props.editorTheme]);

  /**
   * Handles the code change event.
   * Sets the editor value with the new code.
   * @param {*} newCode 
   */
  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined) {
      setEditorValue(newCode);
      setLineToHighlight([]);
    }
  }

  return (

    <div className="custom-code-editor">
      <Editor
        height={props.height}
        width="100%"
        language={language.id}
        defaultValue=""
        value={editorValue}
        theme={props.editorTheme}
        options={{
          minimap: {
            enabled: false,
          },
          automaticLayout: true,
          mouseWheelZoom: true,
          bracketPairColorization: {
            enabled: true,
            independentColorPoolPerBracketType: true,
          },
        }}
        onMount={handleEditorDidMount}
        onChange={handleCodeChange}
      />
    </div>
  )
}

export default CodeEditor;
