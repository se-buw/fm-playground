import { getAlloyInstance } from "../../../api/toolsApi";
import { saveCode } from "../../../api/playgroundApi";
import { Permalink } from "../../../types";
import { LanguageProps } from "../../../components/Playground/Tools";
interface ExecuteAlloyProps {
  editorValue: string;
  language: LanguageProps;
  setIsExecuting: (value: boolean) => void;
  showErrorModal: (value: string) => void;
  alloySelectedCmd: number;
  setAlloyInstance: (value: any) => void;
  permalink: Permalink;
  setPermalink: (value: Permalink) => void;
}

export const executeAlloyTool = async (
  { editorValue,
    language,
    setIsExecuting,
    setAlloyInstance,
    showErrorModal,
    alloySelectedCmd,
    permalink, 
    setPermalink
  }: ExecuteAlloyProps) => {

  const metadata = { 'cmd': alloySelectedCmd + 1 }
  const response = await saveCode(editorValue, language.short, permalink.permalink || null, metadata);
  if (response) { setPermalink(response.data); }
  else {
    showErrorModal('Something went wrong. Please try again later.')
    setIsExecuting(false);
  }

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