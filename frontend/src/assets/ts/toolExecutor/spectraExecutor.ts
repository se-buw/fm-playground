import { LanguageProps } from "../../../components/Playground/Tools";
import { getLineToHighlight } from "../lineHighlightingUtil";
import { executeSpectra } from "../../../api/toolsApi";
import { saveCode } from "../../../api/playgroundApi";
import { Permalink } from "../../../types";

interface ExecuteSpectraProps {
  editorValue: string;
  language: LanguageProps;
  setLineToHighlight: (value: number[]) => void;
  setIsExecuting: (value: boolean) => void;
  setOutput: (value: string) => void;
  showErrorModal: (value: string) => void;
  spectraCliOption: string;
  permalink: Permalink;
  setPermalink: (value: Permalink) => void;
}

export const executeSpectraTool = async (
  { editorValue,
    language,
    setLineToHighlight,
    setIsExecuting,
    setOutput,
    showErrorModal,
    spectraCliOption,
    permalink,
    setPermalink
  }: ExecuteSpectraProps) => {

  const metadata = { 'cli_option': spectraCliOption }
  const response = await saveCode(editorValue, language.short, permalink.permalink || null, metadata);
  if (response) { setPermalink(response.data); }
  else {
    showErrorModal('Something went wrong. Please try again later.')
    setIsExecuting(false);
  }
  try {
    const res = await executeSpectra(editorValue, spectraCliOption);
    setLineToHighlight(getLineToHighlight(res.result, language.id) || []);
    setOutput(res.result);
  } catch (err: any) {
    if (err.response.status === 503) {
      showErrorModal(err.response.data.result);
    } else if (err.response.status === 429) {
      showErrorModal("Slow down! You are making too many requests. Please try again later.");
    }
  }
  setIsExecuting(false);
}