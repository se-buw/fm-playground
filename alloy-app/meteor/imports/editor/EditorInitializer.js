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

const alloy_lang = {

    keywords: [
      'one', 'lone', 'none', 'some', 'abstract', 'all', 'iff', 'but', 'else', 'extends', 'set', 'implies', 
      'module', 'open', 'and', 'disj', 'for', 'in', 'no', 'or', 'as', 'Int', 'String', 'sum', 'exactly', 
      'iden', 'let', 'not', 'univ', 'enum', 'var', 'steps', 'always', 'historically', 'eventually', 'once', 
      'after', 'before', 'until', 'since', 'releases', 'triggered', 'check', 'fact', 'sig', 'fun', 'pred', 
      'assert', 'run',
    ],
  
    operators: [
      '=>', '<=>', '++', '=<', '->', '>=', '||', '<:', ':>', '&&', '!=', '+', '-', '&', '.', '~', '*', '^',
      '!', '#',
    ],
  
    // we include these common regular expressions
    symbols:  /[=><!~?:&|+\-*\/\^%]+/,
  
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  
    // The main tokenizer for our languages
    tokenizer: {
      root: [
        // identifiers and keywords
        [/[a-zA-Z_][\w$]*/, { cases: { '@keywords': 'keyword',
                                     '@default': 'identifier' } }],
        [/[A-Z][\w\$]*/, 'type.identifier' ], 
  
        // whitespace
        { include: '@whitespace' },
  
        // delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, { cases: { '@operators': 'operator',
                                '@default'  : '' } } ],
  
        // numbers
        [/[0-9]/, 'number'],
  
        // delimiter: after number because of .\d floats
        [/[;,.]/, 'delimiter'],
  
        // strings
        [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
        [/"/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],
  
        // characters
        [/'[^\\']'/, 'string'],
        [/(')(@escapes)(')/, ['string','string.escape','string']],
        [/'/, 'string.invalid'],
      ],
  
      comment: [
        [/[^\/*]+/, 'comment' ],
        [/\/\*/,    'comment', '@push' ],    // nested comment
        ["\\*/",    'comment', '@pop'  ],
        [/[\/*]/,   'comment' ]
      ],
  
      string: [
        [/[^\\"]+/,  'string'],
        [/@escapes/, 'string.escape'],
        [/\\./,      'string.escape.invalid'],
        [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ],
      ],
  
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/,       'comment', '@comment' ],
        [/\/\/.*$/,    'comment'],
        [/\s*--.*$/,    'comment'],
      ],
    },
  };

const alloy_conf = {
    comments: {
      lineComment: "//",
    },
    brackets: [['{', '}'], ['[', ']'], ['(', ')']],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' }
    ],
}
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

    monaco.languages.register({ id: 'als' });
    monaco.languages.setLanguageConfiguration('als', alloy_conf);
    monaco.languages.setMonarchTokensProvider('als', alloy_lang);
    // const editor = CodeMirror.fromTextArea(htmlElement, options)
    const editor = monaco.editor.create(document.getElementById('container'), {
        value: 'sig A{}\nrun {}',
        language: 'als',
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
