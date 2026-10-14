
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    // Support the existing auth storage format.
    const auth = localStorage.getItem("auth");
    const standaloneToken = localStorage.getItem("token");

    let token = standaloneToken;

    if (auth) {
      try {
        const parsedAuth = JSON.parse(auth);
        if (parsedAuth.token) {
          token = parsedAuth.token;
        }
      } catch {
        console.error("Invalid auth data in localStorage");
      }
    }

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // Let Axios/browser set multipart Content-Type and its boundary.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
