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
    showErrorModal('Unable to generate permalink. Please try again later.')
    setIsExecuting(false);
  }
  try {
    const res = await executeSpectra(response?.data, spectraCliOption);
    setLineToHighlight(getLineToHighlight(res, language.id) || []);
    setOutput(res);
  } catch (err: any) {
    showErrorModal(err.response);
  }
  setIsExecuting(false);
}