import { executeZ3Wasm } from '@/tools/smt/z3Executor';

// Tool output components
import PlainOutput from '@/components/Playground/PlainOutput';

import { smt2Conf, smt2Lang } from '@/tools/smt/smt2TextMateGrammar';

import type { FmpConfig } from '@/types';

export const additionalInputAreaUiMap: Record<string, React.FC<any>> = {

};

export const additonalOutputAreaUiMap: Record<string, React.FC<any>> = {
};

export const toolExecutionMap: Record<string, () => void> = {
  SMT: executeZ3Wasm,
};

export const toolOutputMap: Record<string, React.FC<any>> = {
  SMT: PlainOutput,
};

export const languageConfigMap: Record<string, { tokenProvider: any; configuration: any }> = {
  smt2: { tokenProvider: smt2Lang, configuration: smt2Conf },
};

export const fmpConfig: FmpConfig = {
  title: 'FM Playground',
  repository: 'https://github.com/se-buw/fm-playground',
  issues: 'https://github.com/se-buw/fm-playground/issues',
  tools: {
    smt2: { name: 'SMT', extension: 'smt2', shortName: 'SMT' },
  },
};
