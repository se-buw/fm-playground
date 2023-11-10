import { initializeAlloyEditor } from '/imports/editor/EditorInitializer'
import * as monaco from 'monaco-editor';
Template.textEditor.onRendered(() => {

    textEditor = initializeAlloyEditor(document.getElementById('editor'))
})