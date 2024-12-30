// Tool executors
import { executeLimboole } from '@/tools/limboole/limbooleExecutor';
import { executeZ3Wasm } from '@/tools/smt/z3Executor';
import { executeNuxmvTool } from '@/tools/nuxmv/nuxmvExecutor';
import { executeAlloyTool } from '@/tools/alloy/alloyExecutor';
import { executeSpectraTool } from '@/tools/spectra/spectraExecutor';

// Tool output components
import PlainOutput from '@/components/Playground/PlainOutput';
import AlloyOutput from '@/components/Playground/alloy/AlloyOutput';

// Language configurations for the different tools
import { limbooleConf, limbooleLang } from '@/tools/limboole/limbooleTextMateGrammar';
import { smt2Conf, smt2Lang } from '@/tools/smt/smt2TextMateGrammar';
import { nuxmvConf, nuxmvLang } from '@/tools/nuxmv/nuxmvTextMateGrammar';
import { alloyConf, alloyLang } from '@/tools/alloy/alloyTextMateGrammar';
import { spectraConf, spectraLang } from '@/tools/spectra/spectraTextMateGrammar';

// Additional input area components for the different tools
import LimbooleCheckOptions from '@/components/Playground/limboole/limbooleCheckOptions';
import SpectraCliOptions from '@/components/Playground/spectra/SpectraCliOptions';
import AlloyCmdOptions from '@/components/Playground/alloy/AlloyCmdOptions';

// Additional output area components for the different tools
import NuxmvCopyrightNotice from '@/components/Playground/nuxmv/NuxmvCopyrightNotice';

import type { FmpConfig } from '@/types';

export const additionalInputAreaUiMap: Record<string, React.FC<any>> = {
  SAT: LimbooleCheckOptions,
  SPECTRA: SpectraCliOptions,
  ALS: AlloyCmdOptions,
};

export const additonalOutputAreaUiMap: Record<string, React.FC<any>> = {
  XMV: NuxmvCopyrightNotice,
};

export const toolExecutionMap: Record<string, () => void> = {
  SAT: executeLimboole,
  SMT: executeZ3Wasm,
  XMV: executeNuxmvTool,
  ALS: executeAlloyTool,
  SPECTRA: executeSpectraTool,
};

export const toolOutputMap: Record<string, React.FC<any>> = {
  SAT: PlainOutput,
  SMT: PlainOutput,
  XMV: PlainOutput,
  ALS: AlloyOutput,
  SPECTRA: PlainOutput,
};

export const languageConfigMap: Record<string, { tokenProvider: any; configuration: any }> = {
  limboole: { tokenProvider: limbooleLang, configuration: limbooleConf },
  smt2: { tokenProvider: smt2Lang, configuration: smt2Conf },
  xmv: { tokenProvider: nuxmvLang, configuration: nuxmvConf },
  als: { tokenProvider: alloyLang, configuration: alloyConf },
  spectra: { tokenProvider: spectraLang, configuration: spectraConf },
};

export const fmpConfig: FmpConfig = {
  title: 'FM Playground',
  repository: 'https://github.com/se-buw/fm-playground',
  issues: 'https://github.com/se-buw/fm-playground/issues',
  tools: {
    limboole: { name: 'Limboole', extension: 'limboole', shortName: 'SAT' },
    smt2: { name: 'SMT', extension: 'smt2', shortName: 'SMT' },
    xmv: { name: 'nuXmv', extension: '.xmv', shortName: 'XMV' },
    als: { name: 'Alloy', extension: 'als', shortName: 'ALS' },
    spectra: { name: 'Spectra', extension: 'spectra', shortName: 'SPECTRA' },
  },
};
