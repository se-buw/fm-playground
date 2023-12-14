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


function run_limboole(wrapper, code) {
  window.input_textarea = "a -> b";
  const info = document.getElementById("info");
  info.innerText = "";

  // let non_ascii = findNonASCII(window.input_textarea);
  // if(non_ascii != null){
  //   info.innerText += `<stdin>:${non_ascii.position}:parse error at '${non_ascii.character}' expected ASCII character\n`;
  //   run_button_enable();
  //   return;
  // }

  wrapper.run.bind(wrapper)(
    code,
    function (line) {
      info.innerText += line + "\n";
    },
    function (line) {
      info.innerText += line + "\n";
    }
  );
}

export default run_limboole;