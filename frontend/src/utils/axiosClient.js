import axios from "axios";

// Production API URL — resolves merge conflict between localhost and render.com
// Using production URL so the app works both locally (via proxy) and on render
const BASE_URL = import.meta.env.VITE_API_URL || "https://codingplatefrom.onrender.com";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios Error:", error.response?.data || error.message);
    return Promise.reject(
      error.response?.data || {
        success: false,
        message: "Something went wrong",
      }
    );
  }
);

export default axiosClient;
