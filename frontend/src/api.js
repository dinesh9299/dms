import axios from "axios";

const API = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "http://192.168.1.95:5000/api",

  withCredentials: true,
});

export default API;
