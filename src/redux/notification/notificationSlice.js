// store/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: '',
  description: '',
  type: 'info',
  showProgress: true,
  pauseOnHover: true,
  visible: false, // trigger to open notification
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      return {
        ...state,
        ...action.payload,
        visible: true,
      };
    },
    clearNotification: (state) => {
      return { ...initialState };
    },
  },
});

export const { showNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
