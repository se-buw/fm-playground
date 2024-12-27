import { getLineToHighlight } from "../lineHighlightingUtil";
import { executeSpectra } from "../../../api/toolsApi";
import { saveCode } from "../../../api/playgroundApi";
import fmpConfig from "../../../../fmp.config";
import { 
  editorValueAtom, 
  jotaiStore, 
  languageAtom, 
  permalinkAtom,
  isExecutingAtom,
  lineToHighlightAtom,
  outputAtom
} from "../../../atoms";


interface ExecuteSpectraProps {
  showErrorModal: (value: string) => void;
  spectraCliOption: string;
}

export const executeSpectraTool = async (
  { showErrorModal,
    spectraCliOption,
  }: ExecuteSpectraProps) => {
  const editorValue = jotaiStore.get(editorValueAtom);
  const language = jotaiStore.get(languageAtom);
  const permalink = jotaiStore.get(permalinkAtom);
  const metadata = { 'cli_option': spectraCliOption }
  const response = await saveCode(editorValue, language.short, permalink.permalink || null, metadata);
  if (response) { jotaiStore.set(permalinkAtom, response.data) }
  else {
    showErrorModal(`Unable to generate permalink. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`)
    jotaiStore.set(isExecutingAtom, false);
  }
  try {
    const res = await executeSpectra(response?.data, spectraCliOption);
    jotaiStore.set(lineToHighlightAtom, (getLineToHighlight(res, language.id) || []));
    jotaiStore.set(outputAtom, (res));
  } catch (err: any) {
    showErrorModal(`${err.message}. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
  }
  jotaiStore.set(isExecutingAtom, false);
}