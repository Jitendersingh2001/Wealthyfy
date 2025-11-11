import { createSlice } from "@reduxjs/toolkit";

/* ------------------------------ Types ------------------------------------ */
interface AccountSetupFormData {
  pan: string;
  mobile: string;
  panVerify: boolean;
  consent: string;
  pancardId?: number | string;
}

interface AccountSetupState {
  formData: AccountSetupFormData;
}

/* ---------------------------- Initial State ------------------------------ */
const initialState: AccountSetupState = {
  formData: {
    pan: "",
    mobile: "",
    panVerify: false,
    consent: "",
  },
};

/* ------------------------------ Slice ------------------------------------ */
const accountSetupSlice = createSlice({
  name: "accountSetup",
  initialState,
  reducers: {
    updatePan: (state, action: { payload: string }) => {
      state.formData.pan = action.payload;
    },
    updateMobile: (state, action: { payload: string }) => {
      state.formData.mobile = action.payload;
    },
    updatePanVerify: (state, action: { payload: boolean }) => {
      state.formData.panVerify = action.payload;
    },
    updateConsent: (state, action: { payload: string }) => {
      state.formData.consent = action.payload;
    },
    updateFormData: (state, action: { payload: Partial<AccountSetupFormData> }) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearFormData: (state) => {
      state.formData = {
        pan: "",
        mobile: "",
        panVerify: false,
        consent: "",
        pancardId: undefined,
      };
    },
  },
});

export const { updatePan, updateMobile, updatePanVerify, updateConsent, updateFormData, clearFormData } =
  accountSetupSlice.actions;

export default accountSetupSlice.reducer;

