import { atom } from "jotai"
import { atomWithStorage } from 'jotai/utils'
import { createStore } from "jotai";

export const jotaiStore = createStore();

export const editorValueAtom = atomWithStorage('editorValue', '')

jotaiStore.sub(editorValueAtom, () => {})