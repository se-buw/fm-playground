// Type definitions for create-fm-playground

export interface Tool {
    name: string;
    value: string;
    description: string;
}

export interface ProjectAnswers {
    projectName: string;
    selectedTools: string[];
    installDeps: boolean;
}

export interface ToolConfig {
    shortName: string;
    extension: string;
    name: string;
    executorImport: string;
    languageImport: string;
    inputComponentImport?: string;
    outputComponentImport?: string;
    outputComponent: string;
    hasInputComponent: boolean;
    hasOutputComponent: boolean;
}

export interface ToolConfigs {
    [key: string]: ToolConfig;
}

export interface GuideEntry {
    id: string;
    title: string;
    content: string;
    language?: string;
}

export interface GuidesJson {
    [key: string]: GuideEntry[];
}
