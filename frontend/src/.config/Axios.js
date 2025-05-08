import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
/*  
    window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://brinblazko.ddns.net/api";
*/
axios.defaults.withCredentials = true;
axios.defaults.baseURL = apiUrl;

export default axios;
