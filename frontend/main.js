const checkMap = {
  0: "VAL",
  1: "SAT",
  2: "QBF",
  3: "SMT",
  4: "XMV",
};

let apiUrl;
if (window.location.hostname == 'localhost' || window.location.hostname === '127.0.0.1') {
  apiUrl = 'http://localhost:8000/api/'; 
}
else{
  apiUrl = '/api/'; 
}

/* --------------Start Limboole Grammar------------ */
const limboole_lang = {

  operators: [
    '<->', '->', '<-', '&','|', '/', '!',
  ],

  // operators
  symbols: /([\.]{2})|([=><!:&\|\+\-\*\/,;]+)/,

  // escape sequences
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  tokenizer: {
    root : [
      // operators
      [ /@symbols/, { cases:{ '@operators': 'keyword'} } ],

      // whitespace
      { include: '@whitespace' },
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/(^%.*$)/, 'comment'],
    ],
  }
};

/* --------------End Limboole Grammar------------ */

/* ---------------Start SMT Grammer--------------- */
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

/* ---------------End SMT Grammer--------------- */

/* ---------------Start nuXmv Grammer--------------- */
const nuXmv_lang = {

  keywords: [
    '@F~', '@O~', 'A', 'ABF', 'ABG', 'abs', 'AF', 'AG', 'array','ASSIGN', 'at next', 'at last', 'AX, bool',
    'boolean', 'BU', 'case', 'Clock', 'clock', 'COMPASSION', 'COMPID', 'COMPUTE', 'COMPWFF', 'CONSTANTS',
    'CONSTARRAY','CONSTRAINT', 'cos', 'count', 'CTLSPEC', 'CTLWFF', 'DEFINE', 'E', 'EBF', 'EBG', 'EF', 'EG', 'esac',
    'EX', 'exp', 'extend', 'F', 'FAIRNESS', 'FALSE', 'floor', 'FROZENVAR', 'FUN', 'G', 'H', 'IN', 'in', 'INIT', 'init',
    'Integer', 'integer', 'INVAR', 'INVARSPEC', 'ISA', 'ITYPE', 'IVAR', 'JUSTICE', 'ln', 'LTLSPEC', 'LTLWFF',
    'MAX', 'max', 'MDEFINE', 'MIN', 'min', 'MIRROR', 'mod', 'MODULE', 'NAME', 'next', 'NEXTWFF', 'noncontinuous',
    'O', 'of', 'PRED', 'PREDICATES', 'pi', 'pow', 'PSLSPEC', 'PARSYNTH', 'READ', 'Real', 'real', 'resize', 'S', 'SAT',
    'self', 'signed', 'SIMPWFF', 'sin', 'sizeof', 'SPEC', 'swconst', 'T', 'tan', 'time', 'time since', 'time until',
    'toint', 'TRANS', 'TRUE', 'typeof', 'U', 'union', 'unsigned', 'URGENT', 'uwconst', 'V', 'VALID', 'VAR', 'Word',
    'word', 'word1', 'WRITE', 'X', 'xnor', 'xor', 'X~ Y', 'Y~', 'Z'
  ],

  operators: [
    '=', '>', '<', '<=', '>=', '!=',
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
      [/\/\--/,    'comment', '@push' ], // nested comments
      ["\\/",    'comment', '@pop'  ],
      [/[\/*]/,   'comment' ],
    ],

    string: [
      [/[^\\"]+/,  'string'],
      [/@escapes/, 'string.escape'],
      [/\\./,      'string.escape.invalid'],
      [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ],
    ],

    whitespace: [
      [/[ \t\v\f\r\n]+/, 'white'],
      [/\/\--/,       'comment', '@comment' ],
      [/\s*--.*$/,    'comment'],
    ],
  },
};
/* ---------------End nuXmv Grammer--------------- */

/* ---------------Start Editor Configuration--------------- */
code = `; Click here and start typing.
`;

monaco.languages.register({ id: 'smt2' });
monaco.languages.register({ id: 'limboole' });
monaco.languages.register({ id: 'nuXmv' });
// Register a tokens provider for the language
monaco.languages.setLanguageConfiguration('smt2', smt2_conf);
monaco.languages.setMonarchTokensProvider('smt2', smt2_lang);
monaco.languages.setMonarchTokensProvider('limboole', limboole_lang);
monaco.languages.setMonarchTokensProvider('nuXmv', nuXmv_lang);



var editor = monaco.editor.create(document.getElementById('input'), {
  value: code,
  language: 'smt2',
  automaticLayout: true ,
  minimap: {
    enabled: false
}});

function setGrammarToLimboole() {
  monaco.editor.setModelLanguage(editor.getModel(), 'limboole');
}

function setGrammarToSmt2() {
  monaco.editor.setModelLanguage(editor.getModel(), 'smt2');
}

function setGrammarTonuXmv() {
  monaco.editor.setModelLanguage(editor.getModel(), 'nuXmv');
}

/* ---------------End of Editor Configuration--------------- */

/* ---------------Start Limboole --------------- */
class StdinToStdoutProcessor {
  stdin() {
    if (this.input_str_pos < this.input_str.length) {
      let c = this.input_str.charCodeAt(this.input_str_pos);
      this.input_str_pos += 1;
      return c;
    } else {
      return null;
    }
  }
  stdout(code) {
    if (code === "\n".charCodeAt(0) && this.stdout_buf !== "") {
      this.print_line_stdout(this.stdout_buf + "\n");
      this.stdout_buf = "";
    } else {
      this.stdout_buf += String.fromCharCode(code);
    }
  }
  stderr(code) {
    if (code === "\n".charCodeAt(0) && this.stderr_buf !== "") {
      this.print_line_stderr(this.stderr_buf + "\n");
      this.stderr_buf = "";
    } else {
      this.stderr_buf += String.fromCharCode(code);
    }
  }

  constructor(creatorFunc, resolve, reject) {
    this.input_str_pos = 0;
    this.input_str = "";
    this.ready = false;

    this.stdout_buf = "";
    this.stderr_buf = "";

    let options = {
      preRun: function (mod) {
        function stdin() {
          return window.input__();
        }

        function stdout(c) {
          window.stdout__(c);
        }

        function stderr(c) {
          window.stderr__(c);
        }

        mod.FS.init(stdin, stdout, stderr);
      },
    };

    var self = this;

    //console.debug("Creating Processor");
    createLimbooleModule(options).then(function (Module) {
      self.Module = Module;
      window.input__ = function () {
        return "";
      };
      window.stdout__ = function (_) {};
      window.stderr__ = function (_) {};

      //console.debug("Initial Processor Startup");
      Module.callMain();
      //console.debug("Initialized Processor");
      self.limboole = Module.cwrap("limboole_extended", "number", [
        "number",
        "array",
        "number",
        "string",
        "number",
      ]);
      resolve();
      self.ready = true;
    });
  }

  run(input, satcheck, stdout_writeln, stderr_writeln) {
    this.input_str = input;
    this.input_str_pos = 0;
    this.print_line_stdout = stdout_writeln;
    this.print_line_stderr = stderr_writeln;

    window.stdout__ = this.stdout.bind(this);
    window.stderr__ = this.stderr.bind(this);

    let status = this.limboole(1, [""], satcheck, input, input.length);
    
    save_to_db(input);

    if (this.stdout_buf != "") {
      this.print_line_stdout(this.stdout_buf);
      this.stdout_buf = "";
    }
    if (this.stderr_buf != "") {
      this.print_line_stderr(this.stdout_buf);
      this.stderr_buf = "";
    }
  }
}

class ProcessorWrapper {
  constructor(processor, name, args) {
    this.processor = processor;
    this.name = name;
    this.args = args;
  }

  run(input, stdout, stderr) {
    if (!this.ready()) {
      alert(
        "Not yet ready for execution! Wait until Limboole has been downloaded and compiled!"
      );
      return;
    }
    this.processor.run(input, this.args, stdout, stderr);
  }

  ready() {
    return this.processor.ready;
  }
}


function run_limboole(wrapper) {
  window.input_textarea = editor.getModel().getValue();
  window.stdout_textarea = document.getElementById("stdout");
  window.stderr_textarea = document.getElementById("stderr");

  function writeln(element, line) {
    element.value += line;

    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
  }

  window.stdout_textarea.value = "";
  window.stderr_textarea.value = "";

  wrapper.run.bind(wrapper)(
    editor.getModel().getValue(),
    function (line) {
      writeln(window.stdout_textarea, line);
    },
    function (line) {
      writeln(window.stderr_textarea, line);
    }
  );
  run_button_enable();
}

window.LimbooleLoadedPromise = new Promise(function (resolve, reject) {
  window.Processors = [
    new StdinToStdoutProcessor(createLimbooleModule, resolve, reject),
  ];
});

window.Wrappers = [
  new ProcessorWrapper(window.Processors[0], "Limboole Validity", 0),
  new ProcessorWrapper(window.Processors[0], "Limboole Satisfiability", 1),
  new ProcessorWrapper(window.Processors[0], "Limboole QBF Satisfiability", 2),
];

let selector = document.getElementById("select_wrapper");
let o_option = document.createElement("option");
o_option.appendChild(document.createTextNode("Select a tool"));
o_option.value = -1;
selector.appendChild(o_option);
for (let i = 0; i < window.Wrappers.length; ++i) {
  let proc = window.Wrappers[i];
  let o = document.createElement("option");
  o.appendChild(document.createTextNode(proc.name));
  o.value = i;
  selector.appendChild(o);
}
let o_smt = document.createElement("option");
o_smt.appendChild(document.createTextNode("SMT"));
o_smt.value = 3;
selector.appendChild(o_smt);
let o_xmv = document.createElement("option");
o_xmv.appendChild(document.createTextNode("nuXmv"));
o_xmv.value = 4;
selector.appendChild(o_xmv);

/* ---------------Start SMT/Z3 --------------- */
var z3_loaded = false;

Module = {};
Module.onRuntimeInitialized = () => { console.log("z3 loaded"); z3_loaded = true; };

Module.print = (text) => { 
  const info = document.getElementById("info");
  info.innerText += text + "\n";
};

function run_z3(code) {
  const info = document.getElementById("info");
  editor.getModel().setValue(code);
  if (z3_loaded) {
    try {
      info.innerText = "";
      save_to_db(code);
      let res = Z3.solve(code);
      info.innerText += res;
    } catch (error) {
      console.error(error);
      // info.innerText += error;
    }
  } else {
    info.innerText = "Wait for Z3 to load and try again."
  }
  run_button_enable()
}


/* ---------------Start nuXmv --------------- */
function run_nuxmv(code) {
  const info = document.getElementById("info");
  editor.getModel().setValue(code);
  fetch(apiUrl+'run_nuxmv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({code: code}),
  })
  .then(response => {
    if (response.status === 200) {
        return response.json();
    } else if(response.status === 413){
      alert("Code size is too large!");
      throw new Error('Request failed with status ' + response.status);
    } else if(response.status === 429){
      alert("Slow Down! You've already made a request recently.");
      throw new Error('Request failed with status ' + response.status);
    }else {
      throw new Error('Request failed with status ' + response.status);
    }
  })
  .then(data => {
    try {
      info.innerText = "";
      info.innerText += data.result;
      save_to_db(code);
    } catch (error) {
      console.error(error);
      //info.innerText += error;
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  run_button_enable();

}
/* ---------------End nuXmv --------------- */

function run_() {
  let selector = document.getElementById("select_wrapper");
  var run_button = document.getElementById("run-btn");

  run_button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Running...';
  run_button.disabled = true;
  if(selector.value == -1) {
    alert("Please select a tool!");
    run_button_enable();
  }
  else if(selector.value >= 0 && selector.value < 3) {
    let wr = window.Wrappers[selector.options.selectedIndex-1];
    run_limboole(wr);
  }
  else if(selector.value == 3) {
    run_z3(editor.getModel().getValue());
  }
  else if(selector.value == 4) {
    run_nuxmv(editor.getModel().getValue());
  }

};

function save_to_db(code){
  var urlParams = new URLSearchParams(window.location.search);
  var checkValue = urlParams.get("check");
  var permalink = urlParams.get("p");
  fetch(apiUrl+'save', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: permalink, 
      check: checkValue.toUpperCase(),
      code: code}),
  })
  .then(response => {
    if (response.status === 200) {
        return response.json();
    } 
    else if(response.status === 413){
      alert("Code size is too large!");
      throw new Error('Request failed with status ' + response.status);
    } 
    else if(response.status === 429) {
      alert("Slow Down! You've already made a request recently.");
      throw new Error('Request failed with status ' + response.status);
    }
  })
  .then(data => {
    let url = "/?check="+data.check+"&p="+data.permalink;
    window.history.pushState({}, null, url);
    var copyText = document.getElementById("permalink");
    copyText.select();
    copyText.value = window.location.href;
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}


function run_button_enable() {
  var run_button = document.getElementById("run-btn");

  run_button.disabled = false;
  run_button.innerHTML = 'Run';
}


document.getElementById('select_wrapper').addEventListener('change', function() {
  let selectedValue = this.value;
  var urlParams = new URLSearchParams(window.location.search);
  var permalink = urlParams.get("p");
  if (permalink) {
    let url = "/?check="+checkMap[selectedValue]+"&p="+permalink;
    window.history.pushState({}, null, url);
  }else{
    window.history.pushState({}, null, "/?check=" + checkMap[selectedValue]);
  }

  if (selectedValue >=0 && selectedValue < 3) {
    setGrammarToLimboole();
    loadResourceGuide('limboole-guide.html');
    loadOutputArea('limboole-output.html');
  }
  else if (selectedValue == 3) {
    setGrammarToSmt2();
    loadResourceGuide('smt-guide.html');
    loadOutputArea('smt-output.html');
  }
  else if (selectedValue == 4) {
    loadResourceGuide('xmv-guide.html');
    loadOutputArea('xmv-output.html');
  }
});


function copy_permalink(){
  var copyText = document.getElementById("permalink");
  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/
  navigator.clipboard.writeText(copyText.value);
}

function uploadFile() {

  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt, .smt2, .smv'; // Optionally, you can restrict the file type

  input.onchange = function(e) {
      var file = e.target.files[0];
      var reader = new FileReader();

      reader.onload = function() {
        editor.getModel().setValue(reader.result);
      }

      reader.readAsText(file);
  }

  input.click();
}

function downloadFile() {
  let selector = document.getElementById("select_wrapper");
  const content = editor.getModel().getValue();

  let filename = "code.txt"
  if(selector.value < 3){
    filename = 'code.txt';
  }else if(selector.value == 3){
    filename = 'code.smt2';
  }else if(selector.value == 4){
    filename = 'code.smv';
  }

  const blob = new Blob([content], { type: 'text/plain'});
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function loadResourceGuide(filename) {

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              document.getElementById("resource-guide-wrapper").innerHTML = xhr.responseText;
          }
      }
  };

  xhr.open("GET", "./static/html/"+filename, true);
  xhr.send();
}

function loadOutputArea(filename) {

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
              document.getElementById("output-wrapper").innerHTML = xhr.responseText;
          }
      }
  };

  xhr.open("GET", "./static/html/"+filename, true);
  xhr.send();
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

document.addEventListener("DOMContentLoaded", function() {
  var urlParams = new URLSearchParams(window.location.search);
  var checkValue = urlParams.get("check");
  var permalink = urlParams.get("p");
  if (checkValue) {
    document.getElementById("select_wrapper").value = getKeyByValue(checkMap, checkValue.toUpperCase());
    window.history.pushState({}, null, "/?check=" + checkValue);
    switch(checkValue.toUpperCase()){
      case "VAL": case "SAT": case "QBF":
        loadResourceGuide('limboole-guide.html');
        loadOutputArea('limboole-output.html');
        setGrammarToLimboole();
        break;
      case "SMT":
        loadResourceGuide('smt-guide.html');
        loadOutputArea('smt-output.html');
        setGrammarToSmt2(); 
        break;
      case "XMV":
        loadResourceGuide('xmv-guide.html');
        loadOutputArea('xmv-output.html');
        setGrammarTonuXmv();
        break;
      default:
        document.getElementById('select_wrapper').value = -1; 
    }
  }
  if (permalink){
    let code_content;
    fetch(apiUrl+"permalink/?check=" + checkValue.toUpperCase()+"&p="+permalink)
    .then(response => {
      if (response.status === 404) {
        alert("Permalink not found!");
      }
      else if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      code_content = data.code;
      editor.getModel().setValue(code_content);
      window.history.pushState({}, null, "/?check=" + checkValue+"&p="+permalink);
    })
    .catch((error) => {
      console.error('Error:', error);
    }); 
  }
});
