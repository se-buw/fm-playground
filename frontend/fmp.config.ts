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

export type ToolDropdown = {
  label: string;
  value: string;
}

export interface Tool {
  name: string;
  extension: string;
  shortName: string;
  dropdown: ToolDropdown;
  commandDropdown?: ToolDropdown[];
  language: LanguageConfig;
  apiUrl: string;
  apiUrlNext?: string;
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
      extension: ".limboole",
      shortName: "SAT",
      dropdown: {
        label: "Limboole",
        value: "0",
      },
      commandDropdown: [
        { value: "0", label: "Validity" },
        { value: "1", label: "Satisfiability" },
        { value: "2", label: "QBF Satisfiability" },
      ],
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
      extension: ".smt2",
      shortName: "SMT",
      dropdown: {
        label: "SMT",
        value: "3",
      },
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
      extension: ".smv",
      shortName: "XMV",
      dropdown: {
        label: "nuXmv",
        value: "4",
      },
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
      extension: ".als",
      shortName: "ALS",
      dropdown: {
        label: "Alloy",
        value: "5",
      },
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
    },
    spectra: {
      name: "Spectra",
      extension: ".spectra",
      shortName: "SPECTRA",
      dropdown: {
        label: "Spectra",
        value: "6",
      },
      commandDropdown: [
        { value: 'check-realizability', label: 'Check Realizability' },
        { value: 'concrete-controller', label: 'Synthesize Controller' },
        { value: 'concrete-counter-strategy', label: 'Counter-strategy' },
        { value: 'unrealizable-core', label: 'Unrealizable core' },
        { value: 'check-well-sep', label: 'Check well-separation' },
        { value: 'non-well-sep-core', label: 'Non-well-separated core' },
      ],
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
    },
  },
};

export default fmpConfig;
