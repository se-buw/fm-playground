import axios from "axios";

/**
 * Create an axios instance with the withCredentials option set to true
 * @returns axios instance
 */
const axiosAuth = axios.create({
  withCredentials: true,
});

export default axiosAuth;