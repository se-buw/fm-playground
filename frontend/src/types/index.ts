export type Permalink = {
    check: string | null;
    permalink: string | null;
};

export interface Tool {
    name: string;
    extension: string;
    shortName: string;
}

export type FmpConfig = {
    title: string;
    repository?: string;
    issues?: string;
    tools: Record<string, Tool>;
};
