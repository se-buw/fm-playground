export interface Tool {
  name: string;
  extension: string;
  shortName: string;
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
    },
    smt: {
      name: "SMT",
      extension: "smt2",
      shortName: "SMT",
    },
    nuxmv: {
      name: "nuXmv",
      extension: ".xmv",
      shortName: "XMV",
    },
    alloy: {
      name: "Alloy",
      extension: "als",
      shortName: "ALS",
    },
    spectra: {
      name: "Spectra",
      extension: "spectra",
      shortName: "SPECTRA",
    },
  },
};

export default fmpConfig;
