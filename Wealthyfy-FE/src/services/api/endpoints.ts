export const ENDPOINTS = {
  USER: {
    GET_USER: (id: string | number) => `/users/get_user/${id}`,
    VERIFY_PANCARD: `/users/verify_pancard`,
  },
};
