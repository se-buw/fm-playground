import { LanguageProps } from "../../../components/Playground/Tools";
import { getLineToHighlight } from "../lineHighlightingUtil";
import { executeNuxmv } from "../../../api/toolsApi";
import { saveCode } from "../../../api/playgroundApi";
import { Permalink } from "../../../types";

interface ExecuteNuxmvProps {
  editorValue: string;
  language: LanguageProps;
  setLineToHighlight: (value: number[]) => void;
  setIsExecuting: (value: boolean) => void;
  setOutput: (value: string) => void;
  showErrorModal: (value: string) => void;
  permalink: Permalink;
  setPermalink: (value: Permalink) => void;
}

export const executeNuxmvTool = async (
  { editorValue,
    language,
    setLineToHighlight,
    setIsExecuting,
    setOutput,
    showErrorModal,
    permalink,
    setPermalink
  }: ExecuteNuxmvProps) => {

  const response = await saveCode(editorValue, language.short, permalink.permalink || null, null);
  if (response) { setPermalink(response.data); }
  else {
    showErrorModal('Unable to generate permalink. Please try again later.')
    setIsExecuting(false);
  }

  try {
    const res = await executeNuxmv(response?.data);
    setLineToHighlight(getLineToHighlight(res, language.id) || []);
    setOutput(res);
  } catch (err: any) {
    showErrorModal(err.response);
  }
  setIsExecuting(false);
}