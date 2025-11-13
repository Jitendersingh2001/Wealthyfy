import axios, { AxiosError, type AxiosResponse } from "axios";
import { config } from "@/config/config";
import { keycloakService } from "@/services/keycloak";

const axiosClient = axios.create({
  baseURL: config.app.apiBaseUrl,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use(async (req) => {
  const token = await keycloakService.getValidToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

axiosClient.interceptors.response.use(
  (res: AxiosResponse) => {
    res.data = {
      data: res.data?.data ?? res.data,
      message: res.data?.message ?? null,
    };
    return res;
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    return Promise.reject({
      message: error.message,
      status,
      data: error.response?.data,
    });
  }
);

export default axiosClient;
