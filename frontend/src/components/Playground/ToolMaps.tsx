import LimbooleCheckOptions from '@/components/Playground/limboole/limbooleCheckOptions';
import SpectraCliOptions from '@/components/Playground/spectra/SpectraCliOptions';
import AlloyCmdOptions from '@/components/Playground/alloy/AlloyCmdOptions';

import { executeLimboole } from '@/assets/ts/toolExecutor/limbooleExecutor';
import { executeZ3Wasm } from '@/assets/ts/toolExecutor/z3Executor';
import { executeNuxmvTool } from '@/assets/ts/toolExecutor/nuxmvExecutor';
import { executeAlloyTool } from '@/assets/ts/toolExecutor/alloyExecutor';
import { executeSpectraTool } from '@/assets/ts/toolExecutor/spectraExecutor';

import PlainOutput from '@/components/Playground/PlainOutput';
import AlloyOutput from '@/components/Playground/alloy/AlloyOutput';

import { limbooleConf, limbooleLang } from '@/assets/languages/limboole';
import { smt2Conf, smt2Lang } from '@/assets/languages/smt2';
import { nuxmvConf, nuxmvLang } from '@/assets/languages/nuxmv';
import { alloyConf, alloyLang } from '@/assets/languages/alloy';
import { spectraConf, spectraLang } from '@/assets/languages/spectra';

export const additionalInputAreaUiMap: Record<string, React.FC<any>> = {
  SAT: LimbooleCheckOptions,
  SPECTRA: SpectraCliOptions,
  ALS: AlloyCmdOptions,
};

export const toolExecutionMap: Record<string, () => void> = {
  SAT: executeLimboole,
  SMT: executeZ3Wasm,
  XMV: executeNuxmvTool,
  ALS: executeAlloyTool,
  SPECTRA: executeSpectraTool
};

export const toolOutputMap: Record<string, React.FC<any>> = {
  SAT: PlainOutput,
  SMT: PlainOutput,
  XMV: PlainOutput,
  ALS: AlloyOutput,
  SPECTRA: PlainOutput
};

export const languageConfigMap: Record<string, { tokenProvider: any; configuration: any }> = {
  limboole: { tokenProvider: limbooleLang, configuration: limbooleConf },
  smt2: { tokenProvider: smt2Lang, configuration: smt2Conf },
  xmv: { tokenProvider: nuxmvLang, configuration: nuxmvConf },
  als: { tokenProvider: alloyLang, configuration: alloyConf },
  spectra: { tokenProvider: spectraLang, configuration: spectraConf }
}
