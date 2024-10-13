import axios from "axios";

import fmpConfig from "../../fmp.config";
import { Permalink } from "../types";


export async function executeNuxmv(permalink: Permalink) {
  let url = `${fmpConfig.tools.nuxmv.apiUrl}?check=${permalink.check}&p=${permalink.permalink}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function executeZ3(permalink: Permalink) {
  let url = `${fmpConfig.tools.smt.apiUrl}?check=${permalink.check}&p=${permalink.permalink}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
} 

export async function executeSpectra(permalink: Permalink, command: string) {
  let url = `${fmpConfig.tools.spectra.apiUrl}?check=${permalink.check}&p=${permalink.permalink}&command=${command}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getAlloyInstance(permalink: Permalink, cmd: number) {
  let url = `${fmpConfig.tools.alloy.apiUrl}?check=${permalink.check}&p=${permalink.permalink}&cmd=${cmd}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getAlloyNextInstance(specId: string | null) {
  let url = fmpConfig.tools.alloy.apiUrlNext;
  if (!url) {
    throw new Error("Alloy Next Instance API URL not found");
  }
  try {
    const response = await axios.post(url, { specId });
    return response.data;
  } catch (error) {
    throw error;
  }
}