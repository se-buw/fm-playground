import { getLineToHighlight } from "../lineHighlightingUtil";
import { executeNuxmv } from "../../../api/toolsApi";
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

interface ExecuteNuxmvProps {
  setOutput: (value: string) => void;
  showErrorModal: (value: string) => void;
}

export const executeNuxmvTool = async (
  { setOutput,
    showErrorModal,
  }: ExecuteNuxmvProps) => {
  const editorValue = jotaiStore.get(editorValueAtom);
  const language = jotaiStore.get(languageAtom);
  const permalink = jotaiStore.get(permalinkAtom);
  const response = await saveCode(editorValue, language.short, permalink.permalink || null, null);
  if (response) { jotaiStore.set(permalinkAtom, response.data); }
  else {
    showErrorModal(`Something went wrong. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
    jotaiStore.set(isExecutingAtom, false);
  }

  try {
    const res = await executeNuxmv(response?.data);
    jotaiStore.set(lineToHighlightAtom, (getLineToHighlight(res, language.id) || []));
    setOutput(res);
  } catch (err: any) {
    showErrorModal(`${err.message}. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
  }
  jotaiStore.set(isExecutingAtom, false);
}