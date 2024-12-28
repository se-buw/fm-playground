import { atom } from "jotai"
import { atomWithStorage } from 'jotai/utils'
import { createStore } from "jotai";
import { fmpConfig } from "./components/Playground/ToolMaps";

export const jotaiStore = createStore();

const rawStringStorage = {
  getItem(key: string) {
    const val = localStorage.getItem(key)
    return val ?? ''
  },
  setItem(key: string, value: string) {
    localStorage.setItem(key, value)
  },
  removeItem(key: string) {
    localStorage.removeItem(key)
  },
}
const defaultLanguage = Object.entries(fmpConfig.tools)
  .map(([key, tool]) => ({
    id: key,
    value: tool.extension,
    label: tool.name,
    short: tool.shortName,
  }))[0]; 
  
export const editorValueAtom = atomWithStorage("editorValue", "", rawStringStorage);
export const languageAtom = atomWithStorage("language", defaultLanguage);
export const permalinkAtom = atom<{ check: string | null, permalink: string | null }>({ check: null, permalink: null });
export const isExecutingAtom = atom(false);
export const lineToHighlightAtom = atom<number[]>([]);
export const outputAtom = atom<string>("");
export const isFullScreenAtom = atom(false);
export const enableLspAtom = atom(false);
export const outputPreviewHeightAtom = atom<string | number >((get) => get(isFullScreenAtom) ? '80vh' : '60vh');


export const spectraCliOptionsAtom = atom('check-realizability');
export const limbooleCliOptionsAtom = atom({ value: "1", label: 'satisfiability' });

export const alloySelectedCmdAtom = atom(0);
export const alloyInstanceAtom = atom<any[]>([]);
export const alloyCmdOptionsAtom = atom<{ value: number, label: string }[]>([]);


jotaiStore.sub(editorValueAtom, () => {})
jotaiStore.sub(languageAtom, () => {})
jotaiStore.sub(lineToHighlightAtom, () => {})
jotaiStore.sub(enableLspAtom, () => {})
jotaiStore.sub(spectraCliOptionsAtom, () => {})
jotaiStore.sub(limbooleCliOptionsAtom, () => {})
jotaiStore.sub(alloySelectedCmdAtom, () => {})
jotaiStore.sub(alloyInstanceAtom, () => {})
jotaiStore.sub(alloyCmdOptionsAtom, () => {})
