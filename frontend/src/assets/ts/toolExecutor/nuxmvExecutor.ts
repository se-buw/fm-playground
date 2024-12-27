import { getLineToHighlight } from "../lineHighlightingUtil";
import { executeNuxmv } from "../../../api/toolsApi";
import { saveCode } from "../../../api/playgroundApi";
import { Permalink } from "../../../types";
import fmpConfig from "../../../../fmp.config";
import { editorValueAtom, jotaiStore, languageAtom } from "../../../atoms";

interface ExecuteNuxmvProps {
  setLineToHighlight: (value: number[]) => void;
  setIsExecuting: (value: boolean) => void;
  setOutput: (value: string) => void;
  showErrorModal: (value: string) => void;
  permalink: Permalink;
  setPermalink: (value: Permalink) => void;
}

export const executeNuxmvTool = async (
  { setLineToHighlight,
    setIsExecuting,
    setOutput,
    showErrorModal,
    permalink,
    setPermalink
  }: ExecuteNuxmvProps) => {
  const editorValue = jotaiStore.get(editorValueAtom);
  const language = jotaiStore.get(languageAtom);
  const response = await saveCode(editorValue, language.short, permalink.permalink || null, null);
  if (response) { setPermalink(response.data); }
  else {
    showErrorModal(`Something went wrong. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
    setIsExecuting(false);
  }

  try {
    const res = await executeNuxmv(response?.data);
    setLineToHighlight(getLineToHighlight(res, language.id) || []);
    setOutput(res);
  } catch (err: any) {
    showErrorModal(`${err.message}. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
  }
  setIsExecuting(false);
}