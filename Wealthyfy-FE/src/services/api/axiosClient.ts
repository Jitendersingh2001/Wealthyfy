import axios, { AxiosError, type AxiosResponse } from "axios";
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
