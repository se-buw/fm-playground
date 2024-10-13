interface LanguageConfig {
  tokenProvider: {
    token: string;
    path: string;
  };
  languageConfiguration: {
    configuration: string;
    path: string;
  };
}

interface Tool {
  name: string;
  dropdownLabel: string;
  dropdownValue: string;
  extension: string;
  shortName: string;
  language: LanguageConfig;
  apiUrl: string;
  apiUrlNext?: string;
}


interface FmpConfig {
  title: string;
  tools: Record<string, Tool>;
}


const fmpConfig: FmpConfig = {
  title: "FM Playground",
  tools: {
    limbooleValidity: {
      name: "Limboole",
      dropdownLabel: "Limboole Validity",
      dropdownValue: "0",
      extension: ".limboole",
      shortName: "VAL",
      language: {
        tokenProvider: {
          token: "limbooleLang",
          path: "../../assets/languages/limboole",
        },
        languageConfiguration: {
          configuration: "limbooleConf",
          path: "../../assets/languages/limboole",
        },
      },
      apiUrl: 'http://localhost:8082/limboole/run/',
    },
    limbooleSatisfiability: {
      name: "Limboole",
      dropdownLabel: "Limboole Satisfiability",
      dropdownValue: "1",
      extension: ".limboole",
      shortName: "SAT",
      language: {
        tokenProvider: {
          token: "limbooleLang",
          path: "../../assets/languages/limboole",
        },
        languageConfiguration: {
          configuration: "limbooleConf",
          path: "../../assets/languages/limboole",
        },
      },
      apiUrl: 'http://localhost:8082/limboole/run/',
    },
    limbooleQBF: {
      name: "Limboole",
      dropdownLabel: "Limboole QBF Satisfiability",
      dropdownValue: "2",
      extension: ".limboole",
      shortName: "QBF",
      language: {
        tokenProvider: {
          token: "limbooleLang",
          path: "../../assets/languages/limboole",
        },
        languageConfiguration: {
          configuration: "limbooleConf",
          path: "../../assets/languages/limboole",
        },
      },
      apiUrl: 'http://localhost:8082/limboole/run/',
    },
    smt: {
      name: "SMT",
      dropdownLabel: "SMT",
      dropdownValue: "3",
      extension: ".smt2",
      shortName: "SMT",
      language: {
        tokenProvider: {
          token: "smt2Lang",
          path: "../../assets/languages/smt2",
        },
        languageConfiguration: {
          configuration: "smt2Conf",
          path: "../../assets/languages/smt2",
        },
      },
      apiUrl: 'http://localhost:8082/smt/run/',
    },
    nuxmv: {
      name: "nuXmv",
      dropdownLabel: "nuXmv",
      dropdownValue: "4",
      extension: ".smv",
      shortName: "XMV",
      language: {
        tokenProvider: {
          token: "nuxmvLang",
          path: "../../assets/languages/nuxmv",
        },
        languageConfiguration: {
          configuration: "nuxmvConf",
          path: "../../assets/languages/nuxmv",
        },
      },
      apiUrl: 'http://localhost:8080/xmv/run/',
    },
    alloy: {
      name: "Alloy",
      dropdownLabel: "Alloy",
      dropdownValue: "5",
      extension: ".als",
      shortName: "ALS",
      language: {
        tokenProvider: {
          token: "alloyLang",
          path: "../../assets/languages/alloy",
        },
        languageConfiguration: {
          configuration: "alloyConf",
          path: "../../assets/languages/alloy",
        },
      },
      apiUrl: 'http://localhost:8080/alloy/instance',
      apiUrlNext: 'http://localhost:8080/alloy/nextInstance',
    },
    spectra: {
      name: "Spectra",
      dropdownLabel: "Spectra",
      dropdownValue: "6",
      extension: ".spectra",
      shortName: "SPECTRA",
      language: {
        tokenProvider: {
          token: "spectraLang",
          path: "../../assets/languages/spectra",
        },
        languageConfiguration: {
          configuration: "spectraConf",
          path: "../../assets/languages/spectra",
        },
      },
      apiUrl: 'http://localhost:8081/spectra/run/',
    },
  },
};

export default fmpConfig;
