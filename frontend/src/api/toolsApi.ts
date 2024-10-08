import axios from "axios";

const API_URL = import.meta.env.VITE_FMP_API_URL;


/**
 * Execute nuxmv in the server and return the result
 * @param {*} code
 * @returns result
 */
export async function executeNuxmv(code: string) {
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
export async function executeZ3(code: string) {
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
export async function executeSpectra(code: string, command: string) {
  let url = `${API_URL}/run_spectra`;
  try {
    const response = await axios.post(url, {code: code, command: command});
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getAlloyInstance(code: string, cmd: number) {
  let url = `${API_URL}/getAlloyInstance/${cmd}`;
  try {
    const response = await axios.post(url, { code });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getAlloyNextInstance(specId: string | number | null) {
  let url = `${API_URL}/getAlloyNextInstance`;
  try {
    const response = await axios.post(url, { specId });
    return response.data;
  } catch (error) {
    throw error;
  }
}