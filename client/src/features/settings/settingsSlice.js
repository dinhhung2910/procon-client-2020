import {createSlice} from '@reduxjs/toolkit';

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    solveServer: localStorage.getItem('solveServer') || '',
  },
  reducers: {
    saveSettings: (state, action) => {
      state = action.payload;
      localStorage.setItem('solveServer', action.payload.solveServer);
    },
  },
});

export const {
  saveSettings,
} = settingsSlice.actions;


// THUNKS

// NO THUNKS

export const selectSettings = (state) => state.settings;

export default settingsSlice.reducer;
