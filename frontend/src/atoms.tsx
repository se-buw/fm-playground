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

export const editorValueAtom = atomWithStorage("editorValue", "", rawStringStorage)
export const languageAtom = atomWithStorage("language", JSON.parse(localStorage.getItem('language') || 'null') || Options[0])


jotaiStore.sub(editorValueAtom, () => {})
jotaiStore.sub(languageAtom, () => {})