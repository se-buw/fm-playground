import run_limboole from "../../js/limboole";
import { LanguageProps } from "../../../components/Playground/Tools";
import { getLineToHighlight } from "../lineHighlightingUtil";
import { saveCode } from "../../../api/playgroundApi";
import { Permalink } from "../../../types";
import fmpConfig from "../../../../fmp.config";
import { ToolDropdown } from "../../../../fmp.config";

interface ExecuteLimbooleProps {
  editorValue: string;
  language: LanguageProps;
  limbooleCheckOption: ToolDropdown;
  setLineToHighlight: (value: number[]) => void;
  setIsExecuting: (value: boolean) => void;
  showErrorModal: (value: string) => void;
  permalink: Permalink;
  setPermalink: (value: Permalink) => void;
}

export const executeLimboole = async (
  { editorValue,
    language,
    limbooleCheckOption,
    setLineToHighlight,
    setIsExecuting,
    showErrorModal,
    permalink,
    setPermalink
  }: ExecuteLimbooleProps) => {

  const metadata = { 'check': limbooleCheckOption.label };
  const response = await saveCode(editorValue, language.short, permalink.permalink || null, metadata);
  if (response) { setPermalink(response.data); }
  else {
    showErrorModal(`Something went wrong. If the problem persists, open an <a href="${fmpConfig.issues}" target="_blank">issue</a>`);
    setIsExecuting(false);
  }


  const infoElement = document.getElementById('info');
  const nonAscii = findNonAscii(editorValue);
  if (nonAscii !== -1) {
    setLineToHighlight([nonAscii.line]);
    setIsExecuting(false);
    if (infoElement) {
      infoElement.innerHTML = `<i style='color: red;'>The code contains non-ASCII characters. Please remove the character '${nonAscii.char}' at line ${nonAscii.line}, column ${nonAscii.column} and try again.</i>`;
    }
    return;
  }

  run_limboole(window.Wrappers[limbooleCheckOption.value], editorValue);

  if (infoElement) {
    setLineToHighlight(getLineToHighlight(infoElement.innerHTML, language.id) || []);
  }
  setIsExecuting(false);
};

const findNonAscii = (str: string) => {
  const regex = /[^\x00-\x7F]/g;
  const match = regex.exec(str);
  if (!match) return -1;
  // find the line and column and the non-ascii character
  const line = (str.substring(0, match.index).match(/\n/g) || []).length + 1;
  const column = match.index - str.lastIndexOf('\n', match.index);
  const char = match[0];
  return { line, column, char };
}
