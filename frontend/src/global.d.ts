import * as monaco from 'monaco-editor';

declare global {
  interface Window {
    monaco: typeof monaco;
  }
}