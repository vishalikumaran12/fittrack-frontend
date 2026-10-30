import axios from "axios";

const API = axios.create({
  baseURL: "https://fittrack-backend-urt3.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("fittrack-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;