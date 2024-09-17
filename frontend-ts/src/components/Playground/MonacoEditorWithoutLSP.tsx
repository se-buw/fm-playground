import { useState, useRef, useEffect } from 'react';
import Editor, { OnMount } from "@monaco-editor/react";
import * as monacoEditor from 'monaco-editor';


const PlaygroundEditor: React.FC<PlaygroundMonacoEditorProps> = (props) => {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const [internalEditorValue, setInternalEditorValue] = useState(props.editorValue);
  const [language, setLanguage] = useState(props.language.id);
  const [decorationIds, setDecorationIds] = useState<string[]>([]);

  useEffect(() => {
    setInternalEditorValue(props.editorValue);
  }, [props.editorValue]);

  useEffect(() => {
    setLanguage(props.language.id);
  }, [props.language]);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      if (props.lineToHighlight && props.lineToHighlight.length > 0) {
        const decorations = props.lineToHighlight.map(line => {
          return {
            range: new monacoEditor.Range(line, 1, line, 1),
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
  }, [props.lineToHighlight, decorationIds]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  return (
    <div>
      <Editor
        height="80vh"
        width="50%"
        defaultLanguage={language}
        defaultValue="Write your code here"
        value={internalEditorValue}
        theme={props.editorTheme || "vs-light"}
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
        onMount={handleEditorMount}
      />
    </div>
  );
};

export default PlaygroundEditor;