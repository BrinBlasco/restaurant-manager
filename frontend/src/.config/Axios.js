import axios from "axios";

const apiUrl =
    window.location.hostname === "localhost"
        ? "http://localhost:5000/api"
        : "https://brinblazko.ddns.net/api";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = apiUrl;

export default axios;
