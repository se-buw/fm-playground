import { LanguageProps } from "../../../components/Playground/Tools";
import { getLineToHighlight } from "../lineHighlightingUtil";
import { executeNuxmv } from "../../../api/toolsApi";

interface ExecuteNuxmvProps {
  editorValue: string;
  language: LanguageProps;
  setLineToHighlight: (value: number[]) => void;
  setIsExecuting: (value: boolean) => void;
  setOutput: (value: string) => void;
  showErrorModal: (value: string) => void;
}

export const executeNuxmvTool = async (
  { editorValue,
    language,
    setLineToHighlight,
    setIsExecuting,
    setOutput,
    showErrorModal
  }: ExecuteNuxmvProps) => {

  try {
    const res = await executeNuxmv(editorValue);
    setLineToHighlight(getLineToHighlight(res.result, language.id) || []);
    setOutput(res.result);
  } catch (err:any) {
    if (err.response.status === 503) {
      showErrorModal(err.response.data.result);
    } else if (err.response.status === 429) {
      showErrorModal("Slow down! You are making too many requests. Please try again later.");
    }
  }
  setIsExecuting(false);
}