import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;
axios.defaults.baseURL = apiUrl;

export default axios;
