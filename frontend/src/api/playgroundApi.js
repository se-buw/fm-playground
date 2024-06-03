import axios from "axios";
import axiosAuth from "./axiosAuth";

const API_URL = import.meta.env.VITE_FMP_API_URL

export default axios.create({
  withCredentials: true,
});


/**
 * Handle the logout request
 * @returns true if loggout is successful
 */
export function userLogout() {
  let url = `${API_URL}/logout`;
  try {
    const response = axiosAuth.get(url);
    return response.status === 200;
  } catch (error) {
    console.log(error);
  }
}


/**
 * Return the code associated with the permalink and selected check
 * @param {*} permalink
 * @param {*} check
 * @returns code
 */
export async function getCodeByParmalink(check, permalink) {
  let url = `${API_URL}/permalink/?check=${check}&p=${permalink}`;
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Return code by id
 * @param {*} id data item id
 * @returns {json} {code, check, permalink}
 */
export async function getCodeById(id) {
  let url = `${API_URL}/code/${id}`;
  try {
    const response = await axiosAuth.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Save the code and the check type in the database and return the permalink
 * @param {*} code
 * @param {*} check
 * @returns permalink
 */
export async function saveCode(code, check, parent) {
  let url = `${API_URL}/save`;
  try {
    const response = await axiosAuth.post(url, { code, check, parent});
    if (response.status === 200) {
      return response;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Save the code with additional metadata and return the permalink
 * @param {*} code
 * @param {*} check
 * @param {json} metadata
 * @returns permalink
 */
export async function saveCodeWithMetadata(code, check, parent, metadata) {
  let url = `${API_URL}/save-with-meta`;
  let meta = `{cmd: ${metadata}}`;
  try {
    const response = await axios.post(url, { code, check, parent, meta });
    if (response.status === 200) {
      return response;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Return the list of histories 
 * By default, it returns the first 20 histories
 * @returns list of histories
 */
export async function getHistories() {
  let url = `${API_URL}/histories`;
  try {
    const response = await axiosAuth.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Return the list of histories by pagination
 * @param {int} page 
 * @returns Object with history and has_more_data: true/false
 */
export async function getHistoryByPage(page) {
  let url = `${API_URL}/histories?page=${page}`;
  try {
    const response = await axiosAuth.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Search the user history by query
 * @param {string} query 
 * @returns list of history objects
 */
export async function searchUserHistory(query) {
  let url = `${API_URL}/search?q=${query}`;
  try {
    const response = await axiosAuth.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}


/**
 * Return all the user data stored in the server
 * @returns user data: email, history
 */
export async function downloadUserData() {
  let url = `${API_URL}/download-user-data`;
  try {
    const response = await axiosAuth.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}


/**
 * Delete the user profile and unlink all the data associated with the user
 * @returns true if the profile is deleted
 */
export async function deleteProfile() {
  let url = `${API_URL}/delete-profile`;
  try {
    const response = await axiosAuth.delete(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getProfile() {
  let url = `${API_URL}/@me`;
  try {
    const response = await axiosAuth.get(url);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function isUserLoggedIn() {
  let url = `${API_URL}/check_session`;
  try {
    const response = await axiosAuth.get(url);
    return response.data;
  } catch (error) {
    console.log("Not logged in");
  }
}
