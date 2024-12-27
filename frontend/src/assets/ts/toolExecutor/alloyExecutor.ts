import { getAlloyInstance } from "../../../api/toolsApi";
import { saveCode } from "../../../api/playgroundApi";
import fmpConfig from "../../../../fmp.config";
import { editorValueAtom, jotaiStore, languageAtom, permalinkAtom } from "../../../atoms";


interface ExecuteAlloyProps {
  setIsExecuting: (value: boolean) => void;
  showErrorModal: (value: string) => void;
  alloySelectedCmd: number;
  setAlloyInstance: (value: any) => void;
}

export const executeAlloyTool = async (
  { setIsExecuting,
    setAlloyInstance,
    showErrorModal,
    alloySelectedCmd,
  }: ExecuteAlloyProps) => {
    
  const editorValue = jotaiStore.get(editorValueAtom);
  const language = jotaiStore.get(languageAtom);
  const permalink = jotaiStore.get(permalinkAtom);
  const metadata = { 'cmd': alloySelectedCmd + 1 }
  const response = await saveCode(editorValue, language.short, permalink.permalink || null, metadata);
  if (response) { jotaiStore.set(permalinkAtom, response.data) }
  else {
    showErrorModal(`Something went wrong. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
    setIsExecuting(false);
  }

  try {
    setAlloyInstance([]);
    const res = await getAlloyInstance(response?.data, alloySelectedCmd);
    setAlloyInstance(res)
    setIsExecuting(false);
  } catch (err: any) {
    if (err.response.status === 429) {
      showErrorModal("Slow down! You are making too many requests. Please try again later.")
    }
    else {
      showErrorModal(`${err.message}. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
    }
  }
  setIsExecuting(false);
}