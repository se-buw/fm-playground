import { getAlloyInstance } from "../../../api/toolsApi";

interface ExecuteAlloyProps {
  editorValue: string;
  setIsExecuting: (value: boolean) => void;
  showErrorModal: (value: string) => void;
  alloySelectedCmd: number;
  setAlloyInstance: (value: any) => void;
}

export const executeAlloyTool = async (
  { editorValue,
    setIsExecuting,
    setAlloyInstance,
    showErrorModal,
    alloySelectedCmd
  }: ExecuteAlloyProps) => {

  try {
    setAlloyInstance([]);
    const res = await getAlloyInstance(editorValue, alloySelectedCmd);
    setAlloyInstance(res)
    setIsExecuting(false);
  } catch (err: any) {
    if (err.response.status === 503) {
      showErrorModal(err.response.data.result)
    }
    else if (err.response.status === 429) {
      showErrorModal("Slow down! You are making too many requests. Please try again later.")
    }
  }
  setIsExecuting(false);
}