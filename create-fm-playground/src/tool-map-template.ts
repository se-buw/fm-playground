import type { ToolConfigs } from './types.js';

export const toolMapTemplateContent = `/**
 * This file contains the mappings for tools, their configurations, and UI components
 * used in the FM Playground.
 * To add a new tool, you need to:
 * run \`npm run generate-tool-maps\`
 */

// Tool executors
// Example: import { executeExampleTool } from '@/../tools/exampleTool/exampleToolExecutor';


// Tool output components
// Example: import TextualOutput from '@/components/Playground/TextualOutput';

// Language configurations for the different tools
// Example: import { exampleToolConf, exampleToolLang } from '@/../tools/exampleTool/exampleToolTextMateGrammar';

// Additional input area components for the different tools
// Example: import ExampleToolCheckOptions from '@/../tools/exampleTool/components/exampleToolCheckOptions';


// Additional output area components for the different tools
// Example: import ExampleToolOutput from '@/../tools/exampleTool/components/exampleToolOutput';

import type { FmpConfig } from '@/types';

export const additionalInputAreaUiMap: Record<string, React.FC<any>> = {
  // EXT: ExampleToolCheckOptions,
};

export const additonalOutputAreaUiMap: Record<string, React.FC<any>> = {
  // EXT: NuxmvCopyrightNotice,
};

export const toolExecutionMap: Record<string, () => void> = {
  // EXT: executeExampleTool,
};

export const toolOutputMap: Record<string, React.FC<any>> = {
  // EXT: TextualOutput,
};

export const languageConfigMap: Record<string, { tokenProvider: any; configuration: any }> = {
  // exampleTool: { tokenProvider: exampleToolLang, configuration: exampleToolConf },

};

export const fmpConfig: FmpConfig = {
  title: 'FM Playground',
  // repository: 'https://github.com/se-buw/fm-playground',
  // issues: 'https://github.com/se-buw/fm-playground/issues',
  tools: {
    // exampleTool: { name: 'ExampleTool', extension: 'exampleTool', shortName: 'EXT' },
  },
};
`;

export const toolConfigs: ToolConfigs = {
    limboole: {
        shortName: 'SAT',
        extension: 'limboole',
        name: 'Limboole',
        executorImport: "import { executeLimboole } from '@/../tools/limboole/limbooleExecutor';",
        languageImport: "import { limbooleConf, limbooleLang } from '@/../tools/limboole/limbooleTextMateGrammar';",
        inputComponentImport: "import LimbooleCheckOptions from '@/../tools/limboole/components/limbooleCheckOptions';",
        outputComponent: 'TextualOutput',
        hasInputComponent: true,
        hasOutputComponent: false,
    },
    smt: {
        shortName: 'SMT',
        extension: 'smt2',
        name: 'SMT',
        executorImport: "import { executeZ3Wasm } from '@/../tools/smt/z3Executor';",
        languageImport: "import { smt2Conf, smt2Lang } from '@/../tools/smt/smt2TextMateGrammar';",
        outputComponent: 'TextualOutput',
        hasInputComponent: false,
        hasOutputComponent: false,
    },
    nuxmv: {
        shortName: 'XMV',
        extension: '.xmv',
        name: 'nuXmv',
        executorImport: "import { executeNuxmvTool } from '@/../tools/nuxmv/nuxmvExecutor';",
        languageImport: "import { nuxmvConf, nuxmvLang } from '@/../tools/nuxmv/nuxmvTextMateGrammar';",
        outputComponentImport: "import NuxmvCopyrightNotice from '@/../tools/nuxmv/components/NuxmvCopyrightNotice';",
        outputComponent: 'TextualOutput',
        hasInputComponent: false,
        hasOutputComponent: true,
    },
    alloy: {
        shortName: 'ALS',
        extension: 'als',
        name: 'Alloy',
        executorImport: "import { executeAlloyTool } from '@/../tools/alloy/alloyExecutor';",
        languageImport: "import { alloyConf, alloyLang } from '@/../tools/alloy/alloyTextMateGrammar';",
        inputComponentImport: "import AlloyCmdOptions from '@/../tools/alloy/components/AlloyCmdOptions';",
        outputComponentImport: "import AlloyOutput from '@/../tools/alloy/components/AlloyOutput';",
        outputComponent: 'AlloyOutput',
        hasInputComponent: true,
        hasOutputComponent: true,
    },
    spectra: {
        shortName: 'SPECTRA',
        extension: 'spectra',
        name: 'Spectra',
        executorImport: "import { executeSpectraTool } from '@/../tools/spectra/spectraExecutor';",
        languageImport: "import { spectraConf, spectraLang } from '@/../tools/spectra/spectraTextMateGrammar';",
        inputComponentImport: "import SpectraCliOptions from '@/../tools/spectra/components/SpectraCliOptions';",
        outputComponent: 'TextualOutput',
        hasInputComponent: true,
        hasOutputComponent: false,
    },
};
