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



export interface Tool {
  name: string;
  extension: string;
  shortName: string;
  language: LanguageConfig;
  apiUrl: string;
  additionalUiPath?: string;
  apiUrlNext?: string;
  apiUrlEval?: string;
}


export interface FmpConfig {
  title: string;
  repository?: string;
  issues?: string;
  tools: Record<string, Tool>;
}


const fmpConfig: FmpConfig = {
  title: "FM Playground",
  repository: "https://github.com/se-buw/fm-playground",
  issues: "https://github.com/se-buw/fm-playground/issues",
  tools: {
    limboole: {
      name: "Limboole",
      extension: "limboole",
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
      additionalUiPath: "../../components/Playground/limboole/LimbooleCheckOptions",
    },
    smt: {
      name: "SMT",
      extension: "smt2",
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
      apiUrl: '/smt/smt/run/',
    },
    nuxmv: {
      name: "nuXmv",
      extension: ".xmv",
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
      apiUrl: '/nuxmv/xmv/run/'
    },
    alloy: {
      name: "Alloy",
      extension: "als",
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
      apiUrl: '/alloy/alloy/instance',
      apiUrlNext: '/alloy/alloy/nextInstance',
      apiUrlEval: '/alloy/alloy/eval',
      additionalUiPath: "../../components/Playground/alloy/AlloyCmdOptions",
    },
    spectra: {
      name: "Spectra",
      extension: "spectra",
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
      apiUrl: '/spectra/spectra/run/',
      additionalUiPath: "../../components/Playground/spectra/SpectraCliOptions",
    },
  },
};

export default fmpConfig;
