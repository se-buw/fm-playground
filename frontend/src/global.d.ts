import * as monaco from 'monaco-editor';

declare global {
    interface Window {
        monaco: typeof monaco;
    }
    interface Window {
        Wrappers: any;
    }
    interface Window {
        z3Promise?: Promise<any>;
    }
}
