import { createSlice } from "@reduxjs/toolkit";

/* ------------------------------ Types ------------------------------------ */
interface AccountSetupFormData {
  pan: string;
  mobile: string;
}

interface AccountSetupState {
  formData: AccountSetupFormData;
}

/* ---------------------------- Initial State ------------------------------ */
const initialState: AccountSetupState = {
  formData: {
    pan: "",
    mobile: "",
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
    updateFormData: (state, action: { payload: Partial<AccountSetupFormData> }) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    clearFormData: (state) => {
      state.formData = {
        pan: "",
        mobile: "",
      };
    },
  },
});

export const { updatePan, updateMobile, updateFormData, clearFormData } =
  accountSetupSlice.actions;

export default accountSetupSlice.reducer;

