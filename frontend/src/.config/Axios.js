import axios from "axios";

const isProd = import.meta.env.MODE === "production";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = isProd ? "/api" : "http://localhost:5000/api";

export default axios;
