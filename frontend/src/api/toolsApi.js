import axios from "axios";

const API_URL = import.meta.env.VITE_FMP_API_URL;


/**
 * Execute nuxmv in the server and return the result
 * @param {*} code
 * @returns result
 */
export async function executeNuxmv(code) {
  let url = `${API_URL}/run_nuxmv`;
  try {
    const response = await axios.post(url, { code });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Execute z3 in the server and return the result
 * @param {*} code
 * @returns result
* */
export async function executeZ3(code) {
  let url = `${API_URL}/z3`;
  try {
    const response = await axios.post(url, { code });
    return response.data;
  } catch (error) {
    console.log(error);
  }
} 

