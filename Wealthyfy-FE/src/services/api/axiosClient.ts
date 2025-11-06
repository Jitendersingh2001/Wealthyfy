// src/services/api/axiosClient.ts
import axios, { AxiosError } from "axios";
import { config } from "@/config/config";
import { keycloakService } from "@/services/keycloak";
import { StatusCodes } from "http-status-codes";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/constants/messages";


const axiosClient = axios.create({
  baseURL: config.app.apiBaseUrl,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// Attach token before every request
axiosClient.interceptors.request.use(async (req) => {
  const token = await keycloakService.getValidToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Normalize errors
axiosClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === StatusCodes.INTERNAL_SERVER_ERROR) {
      toast.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    } else if (status === StatusCodes.NOT_FOUND) {
      toast.error(ERROR_MESSAGES.NOT_FOUND);
    }

    return Promise.reject({
      message: error.message,
      status,
      data: error.response?.data,
    });
  }
);

export default axiosClient;
