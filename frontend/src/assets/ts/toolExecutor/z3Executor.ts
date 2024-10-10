import runZ3WASM from "../runZ3WASM";
import { LanguageProps } from "../../../components/Playground/Tools";
import { getLineToHighlight } from "../lineHighlightingUtil";
import { executeZ3 } from "../../../api/toolsApi";

interface ExecuteZ3Props {
  editorValue: string;
  language: LanguageProps;
  setLineToHighlight: (value: number[]) => void;
  setIsExecuting: (value: boolean) => void;
  setOutput: (value: string) => void;
  showErrorModal: (value: string) => void;
  
}

export const executeZ3Wasm = async (
  { editorValue,
    language,
    setLineToHighlight,
    setIsExecuting,
    setOutput,
    showErrorModal
  }: ExecuteZ3Props) => {

  try {
    const res = await runZ3WASM(editorValue);
    if (res.error) {
      showErrorModal(res.error);
    } else {
      setLineToHighlight(getLineToHighlight(res.output, language.id) || []);
      setOutput(res.output);
    }
  } catch (err:any) {
    if (err.message.includes("SharedArrayBuffer is not defined")) {
      const res = await executeZ3(editorValue);
      setLineToHighlight(getLineToHighlight(res.result, language.id) || []);
      setOutput(res.result);
    } else {
      showErrorModal(err.message);
    }
  }
  setIsExecuting(false);
}