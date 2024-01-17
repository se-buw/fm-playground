import axios from "axios";

const API_URL = import.meta.env.VITE_FMP_API_URL;


/**
 * Execute nuxmv in the server and return the result
 * @param {*} code
 * @returns result
 */
export async function executeCmdTool(code) {
  let url = `${API_URL}/run-cmd-tool`;
  try {
    const response = await axios.post(url, { code });
    return response.data;
  } catch (error) {
    throw error;
  }
}



