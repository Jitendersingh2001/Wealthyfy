export const ENDPOINTS = {
  USER: {
    GET_USER: (id: string | number) => `/users/get_user/${id}`,
    VERIFY_PANCARD: `/users/verify_pancard`,
    CREATE_PAN_AND_PHONE_NO: `/users/create_pan_and_phone_no`,
    GET_PANCARD: `/users/pancard`,
    SEND_OTP: `/users/send-otp`,
    VERIFY_OTP: `/users/verify-otp`,
    LINK_BANK: `/users/link-bank`,
    SESSION_STATUS: (consentId: string) => `/users/session-status?consent_id=${consentId}`,
    MARK_SETUP_COMPLETE: `/users/mark-setup-complete`,
  },
  TRANSACTIONS: {
    GET_TRANSACTIONS: () => `/transactions`,
  },
  ACCOUNTS: {
    GET_DEPOSIT_ACCOUNTS: (type: "deposit" | "term_deposit") => 
      `/accounts/deposit?type=${type}`,
    GET_ACCOUNT_DETAILS: (accountId: number) => 
      `/accounts/${accountId}/details`,
  },
};


export const PUSHER_AUTH_ENDPOINT = '/pusher/auth';