import LimbooleCheckOptions from './limboole/limbooleCheckOptions'
import SpectraCliOptions from './spectra/SpectraCliOptions'
import AlloyCmdOptions from './alloy/AlloyCmdOptions'
import { executeLimboole } from '@/assets/ts/toolExecutor/limbooleExecutor';
import { executeZ3Wasm } from '@/assets/ts/toolExecutor/z3Executor';
import { executeNuxmvTool } from '@/assets/ts/toolExecutor/nuxmvExecutor';
import { executeAlloyTool } from '@/assets/ts/toolExecutor/alloyExecutor';
import { executeSpectraTool } from '@/assets/ts/toolExecutor/spectraExecutor';

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