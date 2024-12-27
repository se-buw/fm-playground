import runZ3WASM from "../runZ3WASM";
import { getLineToHighlight } from "../lineHighlightingUtil";
import { executeZ3 } from "../../../api/toolsApi";
import { saveCode } from "../../../api/playgroundApi";
import fmpConfig from "../../../../fmp.config";
import { 
  editorValueAtom, 
  jotaiStore, 
  languageAtom, 
  permalinkAtom,
  isExecutingAtom,
  lineToHighlightAtom,
  outputAtom,
  enableLspAtom
} from "../../../atoms";


export const executeZ3Wasm = async () => {
  const editorValue = jotaiStore.get(editorValueAtom);
  const language = jotaiStore.get(languageAtom);
  const permalink = jotaiStore.get(permalinkAtom);
  const enableLsp = jotaiStore.get(enableLspAtom);
  let response: any = null;
  const metadata = { 'ls': enableLsp };
  try {
    response = await saveCode(editorValue, language.short, permalink.permalink || null, metadata);
    if (response) { jotaiStore.set(permalinkAtom, response.data); }
  }
  catch (error: any) {
    jotaiStore.set(outputAtom, (`Something went wrong. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`));
  }

  try {
    const res = await runZ3WASM(editorValue);
    if (res.error) {
      jotaiStore.set(outputAtom, (res.error));
    } else {
      jotaiStore.set(lineToHighlightAtom, (getLineToHighlight(res.output, language.id) || []));
      jotaiStore.set(outputAtom, (res.output));
    }
  } catch (err: any) {
    jotaiStore.set(outputAtom, ("Could't load WASM module. Trying to execute on the server..."));
    try {
      const res = await executeZ3(response?.data);
      jotaiStore.set(lineToHighlightAtom, (getLineToHighlight(res, language.id) || []));
      jotaiStore.set(outputAtom, (res));
    } catch (error: any) {
      jotaiStore.set(outputAtom, (error.message));
    }
  }
  jotaiStore.set(isExecutingAtom, false);
}