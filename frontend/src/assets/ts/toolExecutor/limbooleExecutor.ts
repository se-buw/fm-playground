import run_limboole from "../../js/limboole";
import { getLineToHighlight } from "../lineHighlightingUtil";
import { saveCode } from "../../../api/playgroundApi";
import { Permalink } from "../../../types";
import fmpConfig, { ToolDropdown } from "../../../../fmp.config";
import { 
  editorValueAtom, 
  jotaiStore, 
  languageAtom, 
  permalinkAtom,
  isExecutingAtom,
  lineToHighlightAtom

} from "../../../atoms";

interface ExecuteLimbooleProps {
  limbooleCheckOption: ToolDropdown;
  showErrorModal: (value: string) => void;
  enableLsp?: boolean;
}

export const executeLimboole = async (
  { limbooleCheckOption,
    showErrorModal,
    enableLsp
  }: ExecuteLimbooleProps) => {

  const editorValue = jotaiStore.get(editorValueAtom);
  const language = jotaiStore.get(languageAtom);
  const permalink: Permalink = jotaiStore.get(permalinkAtom);
  const metadata = { 'check': limbooleCheckOption.label, 'ls': enableLsp };
  const response = await saveCode(editorValue, language.short, permalink.permalink ?? null, metadata);
  if (response) {jotaiStore.set(permalinkAtom, response.data);}
  else {
    showErrorModal(`Something went wrong. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
    jotaiStore.set(isExecutingAtom, false);
  }
  const infoElement = document.getElementById('info');
  run_limboole(window.Wrappers[limbooleCheckOption.value], editorValue);

  if (infoElement) {
    jotaiStore.set(lineToHighlightAtom, (getLineToHighlight(infoElement.innerHTML, language.id) || []));
  }
  jotaiStore.set(isExecutingAtom, false);
};
