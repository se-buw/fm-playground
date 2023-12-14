
/**
 * @file AvailableTools.js
 * @description Available tools for the user to choose from. 
 * @module Config/AvailableTools
 * @exports 
 */
const Options = [
  { id: "limboole",  value: "0", label: "Limboole Validity", short: "VAL" },
  { id: "limboole", value: "1", label: "Limboole Satisfiability", short: "SAT" },
  { id: "limboole", value: "2", label: "Limboole QBF Satisfiability", short: "QBF" },
  { id: "smt2",  value: "3", label: "SMT", short: "SMT" },
  { id: "xmv",  value: "4", label: "NUXMV", short: "XMV" },
  { id: "als",  value: "5", label: "Alloy", short: "ALS" }
];

export default Options;