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
    throw error;
  }
}

/**
 * Execute z3 in the server and return the result
 * @param {*} code
 * @returns result
* */
export async function executeZ3(code) {
  let url = `${API_URL}/run_z3`;
  try {
    const response = await axios.post(url, { code });
    return response.data;
  } catch (error) {
    throw error;
  }
} 

/**
 * Execute spectra in the server and return the result
 * @param {*} code spectra specification
 * @param {*} command command to execute e.g. check_realizability, synthesize_controller, etc.
 * @returns result 
 */
export async function executeSpectra(code, command) {
  let url = `${API_URL}/run_spectra`;
  try {
    const response = await axios.post(url, {code: code, command: command});
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getAlloyGraphData(code, cmd) {
  let url = `${API_URL}/getAlloyInstance/${cmd}`;
  try {
    const response = await axios.post(url, { code });
    let data = JSON.parse(response.data);
    return data;
  } catch (error) {
    throw error;
  }
}