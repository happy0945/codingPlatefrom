import axios from "axios"

const axiosClient =  axios.create({
    baseURL: 'https://codingplatefrom.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
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

