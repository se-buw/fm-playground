import { atom } from "jotai"
import { atomWithStorage } from 'jotai/utils'
import { createStore } from "jotai";
import Options from "./assets/config/AvailableTools";

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

export const editorValueAtom = atomWithStorage("editorValue", "", rawStringStorage);
export const languageAtom = atomWithStorage("language", Options[0]);
export const permalinkAtom = atom<{ check: string | null, permalink: string | null }>({ check: null, permalink: null });
export const isExecutingAtom = atom(false);
export const lineToHighlightAtom = atom<number[]>([]);
export const outputAtom = atom<string>("");
export const isFullScreenAtom = atom(false);

jotaiStore.sub(editorValueAtom, () => {})
jotaiStore.sub(languageAtom, () => {})
jotaiStore.sub(lineToHighlightAtom, () => {})