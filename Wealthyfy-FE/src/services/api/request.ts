import axiosClient from "./axiosClient";

export const apiRequest = {
  get:       <T>(url: string, params?: object) =>
    axiosClient.get<T>(url, { params }).then((res) => res.data),

  post:      <T>(url: string, body?: object) =>
    axiosClient.post<T>(url, body).then((res) => res.data),

  put:       <T>(url: string, body?: object) =>
    axiosClient.put<T>(url, body).then((res) => res.data),

  patch:     <T>(url: string, body?: object) =>
    axiosClient.patch<T>(url, body).then((res) => res.data),

  delete:    <T>(url: string, body?: object) =>
    axiosClient.delete<T>(url, { data: body }).then((res) => res.data),
};
