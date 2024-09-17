interface Playground {
  title: string;
  tools: AvailableTools;
}

interface PlaygroundTitle {
  title: string;
}

interface Tool {
  name: string;
  dropdownLabel: string;
  dropdownValue: string;
  extension: string;
  shortName: string;
  options?: string[];
}

interface AvailableTools {
  [key: string]: Tool;
}

interface PlaygroundMonacoEditorProps {
  editorValue: string;
  lineToHighlight?: number[];
  editorTheme?: string;
  language: {
    id: string;
  };
}

interface Window {
  monaco: typeof monaco;
}