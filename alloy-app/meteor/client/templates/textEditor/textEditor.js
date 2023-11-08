import { initializeAlloyEditor } from '/imports/editor/EditorInitializer'
import * as monaco from 'monaco-editor';
Template.textEditor.onRendered(() => {

    textEditor = initializeAlloyEditor(document.getElementById('editor'))
})



// Template.textEditor.onRendered(function () {
//     textEditor = monaco.editor.create(document.getElementById('editor'), {
//       value: 'console.log("Hello, World!");',
//       language: 'javascript',
//       theme: 'vs-dark',
//     });
//   });
  

