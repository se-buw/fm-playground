import { init } from 'z3-solver';


let evalZ3JSPromise = null;
async function loadEvalZ3() {
  if (evalZ3JSPromise != null) {
    return evalZ3JSPromise;
  }
  evalZ3JSPromise = new Promise((res, rej) => {
    const script = document.createElement('script');
    script.src = '/z3guide/eval-z3.js';
    script.onload = () => {
      res(window.evalZ3Mod.evalZ3JS);
    };
    script.onerror = rej;
    document.head.appendChild(script);
  });
  return evalZ3JSPromise;
}

let Z3Promise = null;
async function loadZ3() {
  if (Z3Promise != null) {
    return Z3Promise;
  }
  Z3Promise = init();
  return Z3Promise;
}

export default async function runZ3JSWeb(input) {
  let output = '';
  let error = '';
  let timeStart, timeEnd;

  const Z3 = await loadZ3();
  const timeout = 10000;

  try {
    Z3.Z3.global_param_set('timeout', String(timeout));
    timeStart = new Date().getTime();
    const evalZ3JS = await loadEvalZ3();
    output = (await evalZ3JS(Z3, input)) ?? '';
  } catch (e) {
    error = e.message ?? 'Error message is empty';
    if (timeStart) {
      timeEnd = new Date().getTime();
      if (timeEnd - timeStart >= timeout) {
        error = error + '\nZ3 timeout\n';
      }
    }
  }

  return JSON.stringify({ output: String(output), error: error });
}
