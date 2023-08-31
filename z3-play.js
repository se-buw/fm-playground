/*! https://github.com/jfmc/z3-play/blob/main/src/z3-play.js - Jose F. Morales, licensed under MIT */
/* SMT2 language configuration */
const smt2_conf = {
    autoClosingPairs: [
        { open: '(', close: ')' }
    ]
};
/* SMT2 language definition (borrowed from monaco editor languages) */
const smt2_lang = {

  // Set defaultToken to invalid to see what you do not tokenize yet
  // defaultToken: 'invalid',

  keywords: [
    'define-fun', 'define-const', 'assert', 'push', 'pop', 'assert', 'check-sat',
    'declare-const', 'declare-fun', 'get-model', 'get-value', 'declare-sort',
    'declare-datatypes', 'reset', 'eval', 'set-logic', 'help', 'get-assignment',
    'exit', 'get-proof', 'get-unsat-core', 'echo', 'let', 'forall', 'exists',
    'define-sort', 'set-option', 'get-option', 'set-info', 'check-sat-using', 'apply', 'simplify',
    'display', 'as', '!', 'get-info', 'declare-map', 'declare-rel', 'declare-var', 'rule',
    'query', 'get-user-tactics'
  ],

 operators: [
    '=', '&gt;', '&lt;', '&lt;=', '&gt;=', '=&gt;', '+', '-', '*', '/',
  ],

  builtins: [
    'mod', 'div', 'rem', '^', 'to_real', 'and', 'or', 'not', 'distinct',
    'to_int', 'is_int', '~', 'xor', 'if', 'ite', 'true', 'false', 'root-obj',
    'sat', 'unsat', 'const', 'map', 'store', 'select', 'sat', 'unsat',
    'bit1', 'bit0', 'bvneg', 'bvadd', 'bvsub', 'bvmul', 'bvsdiv', 'bvudiv', 'bvsrem',
    'bvurem', 'bvsmod',  'bvule', 'bvsle', 'bvuge', 'bvsge', 'bvult',
    'bvslt', 'bvugt', 'bvsgt', 'bvand', 'bvor', 'bvnot', 'bvxor', 'bvnand',
    'bvnor', 'bvxnor', 'concat', 'sign_extend', 'zero_extend', 'extract',
    'repeat', 'bvredor', 'bvredand', 'bvcomp', 'bvshl', 'bvlshr', 'bvashr',
    'rotate_left', 'rotate_right', 'get-assertions'
  ],

  brackets: [
    ['(',')','delimiter.parenthesis'],
    ['{','}','delimiter.curly'],
    ['[',']','delimiter.square']
  ],

  // we include these common regular expressions
  symbols:  /[=&gt;&lt;~&amp;|+\-*\/%@#]+/,

  // C# style strings
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [/[a-z_][\w\-\.']*/, { cases: { '@builtins': 'predefined.identifier',
                                      '@keywords': 'keyword',
                                      '@default': 'identifier' } }],
      [/[A-Z][\w\-\.']*/, 'type.identifier' ],
      [/[:][\w\-\.']*/, 'string.identifier' ],
      [/[$?][\w\-\.']*/, 'constructor.identifier' ],

      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      [/[()\[\]]/, '@brackets'],
      [/@symbols/, { cases: { '@operators': 'predefined.operator',
                              '@default'  : 'operator' } } ],


      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/#[xX][0-9a-fA-F]+/, 'number.hex'],
      [/#b[0-1]+/, 'number.binary'],
      [/\d+/, 'number'],

      // delimiter: after number because of .\d floats
      [/[,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
      [/"/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],

      // user values
      [/\{/, { token: 'string.curly', bracket: '@open', next: '@uservalue' } ],
    ],

    uservalue: [
      [/[^\\\}]+/, 'string' ],
      [/\}/,       { token: 'string.curly', bracket: '@close', next: '@pop' } ],
      [/\\\}/,     'string.escape'],
      [/./,        'string']  // recover
    ],

    string: [
      [/[^\\"]+/,  'string'],
      [/@escapes/, 'string.escape'],
      [/\\./,      'string.escape.invalid'],
      [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ]
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/;.*$/,    'comment'],
    ],
  },
};

code = `; You can edit this code!
; Click here and start typing.
`;

monaco.languages.register({ id: 'smt2' });
// Register a tokens provider for the language
monaco.languages.setLanguageConfiguration('smt2', smt2_conf);
monaco.languages.setMonarchTokensProvider('smt2', smt2_lang);

var editor = monaco.editor.create(document.getElementById('container'), {
  value: code,
  language: 'smt2',
  automaticLayout: true ,
  minimap: {
    enabled: false
  }});

/* --------------------------------------------------------------------------- */

var z3_loaded = false;

function load_in_editor(code) {
  const info = document.getElementById("info");
  editor.getModel().setValue(code);
  info.innerText = "";
}

function my_run_id(code) {
  const info = document.getElementById("info");
  editor.getModel().setValue(code);
  if (z3_loaded) {
    try {
      info.innerText = "";
      let res = Z3.solve(code);
      // console.log(res)
      info.innerText += res;
    } catch (error) {
      console.error(error);
      // info.innerText += error;
    }
  } else {
    info.innerText = "Wait for Z3 to load and try again."
  }
}

Module = {};
Module.onRuntimeInitialized = () => { console.log("z3 loaded"); z3_loaded = true; };

Module.print = (text) => { 
  const info = document.getElementById("info");
  info.innerText += text + "\n";
  //console.log('STDOUT: '+text); 
};

window.onload = function () {
  // Z3["onInitialized"] = () => { console.log("z3 loaded 2"); z3_loaded = true; }

  let button = document.getElementById("run-button");
  button.onclick = () => {
    let code = editor.getModel().getValue();
    my_run_id(code);
  };

  // Grab all pre elements and replace them with textarea button results combo
  var examples = document.getElementsByTagName("pre");
  console.log(examples)
  examples = Array.from(examples)
  for (let code of examples) {
    if (code.className == "listing") {
      let div = document.createElement("div");

      let ta = document.createElement("pre");

      let button = document.createElement("button");
      let br = document.createElement("br");

      ta.style.width = "100%";
      ta.innerHTML = code.textContent.replace(/\r?\n/g, '\r\n');
      button.className = "load-button";
      button.innerHTML = "&#9998; Try it";
      button.onclick = () => {
        load_in_editor(code.textContent);
      };
      div.appendChild(button);
      div.appendChild(ta);
      code.parentNode.replaceChild(div, code);
    }
  }

  // destroy aref that do nothing now
  var badlinks = document.getElementsByTagName('a');
  for (var i = 0; i < badlinks.length; i++) {
    link = badlinks[i]
    if (link.innerHTML == "load in editor") {
      link.innerHTML = ""
      //link.remove()
    }
  }
}
