import run_limboole from "../../js/limboole";
import { LanguageProps } from "../../../components/Playground/Tools";
import { getLineToHighlight } from "../lineHighlightingUtil";
import { saveCode } from "../../../api/playgroundApi";
import { Permalink } from "../../../types";
import fmpConfig, { ToolDropdown } from "../../../../fmp.config";
import { editorValueAtom, jotaiStore } from "../../../atoms";

interface ExecuteLimbooleProps {
  language: LanguageProps;
  limbooleCheckOption: ToolDropdown;
  setLineToHighlight: (value: number[]) => void;
  setIsExecuting: (value: boolean) => void;
  showErrorModal: (value: string) => void;
  permalink: Permalink;
  setPermalink: (value: Permalink) => void;
  enableLsp?: boolean;
}

export const executeLimboole = async (
  { language,
    limbooleCheckOption,
    setLineToHighlight,
    setIsExecuting,
    showErrorModal,
    permalink,
    setPermalink,
    enableLsp
  }: ExecuteLimbooleProps) => {

  const editorValue = jotaiStore.get(editorValueAtom);
  const metadata = { 'check': limbooleCheckOption.label, 'ls': enableLsp };
  const response = await saveCode(editorValue, language.short, permalink.permalink ?? null, metadata);
  if (response) { setPermalink(response.data); }
  else {
    showErrorModal(`Something went wrong. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
    setIsExecuting(false);
  }
  const infoElement = document.getElementById('info');
  run_limboole(window.Wrappers[limbooleCheckOption.value], editorValue);

  if (infoElement) {
    setLineToHighlight(getLineToHighlight(infoElement.innerHTML, language.id) || []);
  }
  setIsExecuting(false);
};
