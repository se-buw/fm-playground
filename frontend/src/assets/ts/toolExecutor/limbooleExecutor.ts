import run_limboole from "../../js/limboole";
import { LanguageProps } from "../../../components/Playground/Tools";
import { getLineToHighlight } from "../lineHighlightingUtil";


interface ExecuteLimbooleProps {
  editorValue: string;
  language: LanguageProps;
  setLineToHighlight: (value: number[]) => void;
  setIsExecuting: (value: boolean) => void;
}

export const executeLimboole = async (
  { editorValue,
    language,
    setLineToHighlight,
    setIsExecuting
  }: ExecuteLimbooleProps) => {
  const infoElement = document.getElementById('info');
  const nonAscii = findNonAscii(editorValue);
  if (nonAscii !== -1) {
    setLineToHighlight([nonAscii.line]);
    setIsExecuting(false);
    if(infoElement) {
      infoElement.innerHTML = `<i style='color: red;'>The code contains non-ASCII characters. Please remove the character '${nonAscii.char}' at line ${nonAscii.line}, column ${nonAscii.column} and try again.</i>`;
    }
    return;
  }

  run_limboole(window.Wrappers[language.value], editorValue);
  
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
