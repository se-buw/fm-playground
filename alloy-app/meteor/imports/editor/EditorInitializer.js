import CodeMirror from 'codemirror'
import { defineAlloyMode } from '/imports/editor/AlloyEditorMode'
import { getCommandsFromCode,
    containsValidSecret } from '../../lib/editor/text'
import 'codemirror/theme/twilight.css'
import 'codemirror/lib/codemirror.css'
import 'qtip2'
import { modelChanged } from '../../client/lib/editor/state'
import * as monaco from 'monaco-editor';

export { initializeAlloyEditor }

/**
 * Editor initialization options.
 */
const options = {
    // Display line numbers.
    lineNumbers: true,
    // Whether CodeMirror should scroll or wrap for long lines. Defaults to false (scroll).
    lineWrapping: true,
    styleActiveLine: true,
    // Highlight matching brackets when editor's standing next to them
    matchBrackets: true,
    // TODO: Allow choosing between multiple themes.
    theme: 'twilight',
    // TODO: This is broken. Must be fixed to permit block folding.
    foldGutter: true,
    // Adds gutters to the editor. In this case a single one is added for the error icon placement
    gutters: []
}

/**
 * Initialization of the code editor, in particular on change listeners.
 */
function initializeAlloyEditor(htmlElement) {
    defineAlloyMode() // specify syntax highlighting

    // const editor = CodeMirror.fromTextArea(htmlElement, options)
    const editor = monaco.editor.create(document.getElementById('container'), {
        value: 'console.log("Hello, World!");',
        language: 'python',
        automaticLayout: true,
        minimap: {
            enabled: false
        }
    });
    // options.mode = 'alloy'

    // Text change event for the editor on alloy4fun/editor page
    editor.getModel().onDidChangeContent(() => {
        $('.qtip').remove()

        if ($.trim(editor.getModel()) == '') {
            // empty model
            Session.set('empty-model', true)
        } else {
            Session.set('empty-model', false)
            const local_secrets = containsValidSecret(editor.getValue())
            // whether there are local secrets defined
            Session.set('local-secrets', local_secrets)
            // update the list of commands, if no local secrets append inherited hidden commands
            const hidden_commands = local_secrets ? [] : (Session.get('hidden_commands') || [])
            Session.set('commands', getCommandsFromCode(editor.getValue()).concat(hidden_commands))
        }
        // notify model changed
        modelChanged()
    })
    // editor.setSize('100%', 400)
    return editor
}
