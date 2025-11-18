import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function useAxiosAuth() {
  const navigate = useNavigate();

  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        navigate("/");
      }
      return Promise.reject(error);
    }
  );
}