import { useState, useRef, useEffect } from 'react'
import Editor from "@monaco-editor/react";
import { limbooleConf, limbooleLang } from '../../assets/languages/limboole'
import { smt2Conf, smt2Lang, smt2ComplitionProvider } from '../../assets/languages/smt2'
import { nuxmvConf, nuxmvLang } from '../../assets/languages/nuxmv'
import { alloyConf, alloyLang } from '../../assets/languages/alloy'
import { spectraConf, spectraLang } from '../../assets/languages/spectra';
import '../../assets/style/Playground.css'

import * as monacoEditor from 'monaco-editor';
import type { LanguageProps } from './Tools';

interface BasicCodeEditorProps {
  height: string;
  setEditorValue: (value: string) => void;
  editorValue: string;
  language: LanguageProps
  setLanguage: (language: LanguageProps) => void;
  lineToHighlight: number[];
  setLineToHighlight: (line: number[]) => void;
  editorTheme: string;
}

interface BasicCodeEditorValueParams {
  value: string;
  event: monacoEditor.editor.IModelContentChangedEvent;
}

const CodeEditor: React.FC<BasicCodeEditorProps> = (props: BasicCodeEditorProps) => {


  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null); // editor reference
  const [internalEditorValue, setInternalEditorValue] = useState(props.editorValue);
  const [language, setLanguage] = useState(props.language.id);
  const [decorationIds, setDecorationIds] = useState<string[]>([]);

  /**
  * Sets the editor value when the editorValue prop changes.
  */
  useEffect(() => {
    setInternalEditorValue(props.editorValue);
  }, [props.editorValue]);

  /**
   * Sets the language when the language prop changes.
  */
  useEffect(() => {
    setLanguage(props.language.id);
  }, [props.language.id]);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      if (props.lineToHighlight !== null && props.lineToHighlight.length > 0) {
        const decorations = props.lineToHighlight.map(line => {
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
  }, [props.lineToHighlight]);

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
    // register limboole language
    monaco.languages.register({ id: 'limboole' })
    monaco.languages.setMonarchTokensProvider('limboole', limbooleLang)
    monaco.languages.setLanguageConfiguration('limboole', limbooleConf)

    // register smt2 language
    monaco.languages.register({ id: 'smt2' })
    monaco.languages.setMonarchTokensProvider('smt2', smt2Lang)
    monaco.languages.setLanguageConfiguration('smt2', smt2Conf)
    monaco.languages.registerCompletionItemProvider('smt2', smt2ComplitionProvider);

    // register nuxmv language
    monaco.languages.register({ id: 'xmv' })
    monaco.languages.setMonarchTokensProvider('xmv', nuxmvLang)
    monaco.languages.setLanguageConfiguration('xmv', nuxmvConf)

    // register alloy language
    monaco.languages.register({ id: 'als' })
    monaco.languages.setMonarchTokensProvider('als', alloyLang)
    monaco.languages.setLanguageConfiguration('als', alloyConf)

    // register spectra language
    monaco.languages.register({ id: 'spectra' })
    monaco.languages.setMonarchTokensProvider('spectra', spectraLang)
    monaco.languages.setLanguageConfiguration('spectra', spectraConf)

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
   * Gets the editor value and sets the editorValue prop.
   * @param {*} value 
   * @param {*} event 
   */


  function getEditorValue({ value, event }: BasicCodeEditorValueParams) {
    if (editorRef.current) {
      const editorValue = editorRef.current.getValue();
      props.setEditorValue(editorValue);
    }
  }

  /**
   * Sets the editor value.
   * @param {*} value
   * @param {*} event
   */
  function setEditorValue({ value, event }: BasicCodeEditorValueParams) {
    if (editorRef.current) {
      editorRef.current.setValue(value);
    }
  }

  /**
   * Handles the code change event.
   * Sets the editor value with the new code.
   * @param {*} newCode 
   */
  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined) {
      props.setEditorValue(newCode);
      props.setLineToHighlight([]);
    }
  }

  return (

    <div className="custom-code-editor">
      <Editor
        height={props.height}
        width="100%"
        language={language}
        defaultValue=""
        value={internalEditorValue}
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
