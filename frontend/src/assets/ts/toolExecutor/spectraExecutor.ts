import { getLineToHighlight } from "../lineHighlightingUtil";
import { executeSpectra } from "../../../api/toolsApi";
import { saveCode } from "../../../api/playgroundApi";
import { Permalink } from "../../../types";
import fmpConfig from "../../../../fmp.config";
import { editorValueAtom, jotaiStore, languageAtom } from "../../../atoms";


interface ExecuteSpectraProps {
  setLineToHighlight: (value: number[]) => void;
  setIsExecuting: (value: boolean) => void;
  setOutput: (value: string) => void;
  showErrorModal: (value: string) => void;
  spectraCliOption: string;
  permalink: Permalink;
  setPermalink: (value: Permalink) => void;
}

export const executeSpectraTool = async (
  { setLineToHighlight,
    setIsExecuting,
    setOutput,
    showErrorModal,
    spectraCliOption,
    permalink,
    setPermalink
  }: ExecuteSpectraProps) => {
  const editorValue = jotaiStore.get(editorValueAtom);
  const language = jotaiStore.get(languageAtom);
  const metadata = { 'cli_option': spectraCliOption }
  const response = await saveCode(editorValue, language.short, permalink.permalink || null, metadata);
  if (response) { setPermalink(response.data); }
  else {
    showErrorModal(`Unable to generate permalink. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`)
    setIsExecuting(false);
  }
  try {
    const res = await executeSpectra(response?.data, spectraCliOption);
    setLineToHighlight(getLineToHighlight(res, language.id) || []);
    setOutput(res);
  } catch (err: any) {
    showErrorModal(`${err.message}. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
  }
  setIsExecuting(false);
}