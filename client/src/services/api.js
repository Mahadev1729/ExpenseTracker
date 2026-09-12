import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const cleanBaseURL = rawBaseURL.replace(/\/$/, "");
const baseURL = cleanBaseURL.endsWith("/api") ? cleanBaseURL : `${cleanBaseURL}/api`;

const API = axios.create({
    baseURL
});

API.interceptors.request.use((req) => {

    const token = localStorage.getItem("token");

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

export default API;
