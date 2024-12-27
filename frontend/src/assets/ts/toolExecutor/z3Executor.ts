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
  lineToHighlightAtom
} from "../../../atoms";
interface ExecuteZ3Props {
  setOutput: (value: string) => void;
  showErrorModal: (value: string) => void;
  enableLsp?: boolean;
}

export const executeZ3Wasm = async (
  { setOutput,
    showErrorModal,
    enableLsp
  }: ExecuteZ3Props) => {
  const editorValue = jotaiStore.get(editorValueAtom);
  const language = jotaiStore.get(languageAtom);
  const permalink = jotaiStore.get(permalinkAtom);
  let response: any = null;
  const metadata = { 'ls': enableLsp };
  try {
    response = await saveCode(editorValue, language.short, permalink.permalink || null, metadata);
    if (response) { jotaiStore.set(permalinkAtom, response.data); }
  }
  catch (error: any) {
    showErrorModal(`Something went wrong. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
  }

  try {
    const res = await runZ3WASM(editorValue);
    if (res.error) {
      showErrorModal(res.error);
    } else {
      jotaiStore.set(lineToHighlightAtom, (getLineToHighlight(res.output, language.id) || []));
      setOutput(res.output);
    }
  } catch (err: any) {
    setOutput("Could't load WASM module. Trying to execute on the server...");
    try {
      const res = await executeZ3(response?.data);
      jotaiStore.set(lineToHighlightAtom, (getLineToHighlight(res, language.id) || []));
      setOutput(res);
    } catch (error: any) {
      showErrorModal(error.message);
    }
  }
  jotaiStore.set(isExecutingAtom, false);
}