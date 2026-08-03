import axios from "axios";

// Local dev  → set VITE_API_URL=http://localhost:5000 in .env
// Production → falls back to the Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL ?? "https://codingplatefrom.onrender.com";

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
