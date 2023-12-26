import { Z3HighLevel, Z3LowLevel } from 'z3-solver';

window.Z3LoadedPromise = new Promise((resolve, reject) => {
  window.Processors = [
    new StdinToStdoutProcessor(Z3HighLevel, resolve, reject),
    new StdinToStdoutProcessor(Z3LowLevel, resolve, reject),
  ];
});

