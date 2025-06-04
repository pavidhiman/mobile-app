import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../Api';

export const updateEula = createAsyncThunk('settings/updateEula', async (args) => {
  const { userID, eulaStatus } = args;

  try {
    const response = await api.put(`/Patient/UpdateEULA/${userID}/${eulaStatus}`, {});
    return response.data;
  } catch (error) {
    console.error('Error occurred while updating eula', error);
    throw error;
  }
});

export const savePatientSettings = createAsyncThunk('settings/savePatientSettings', async (args) => {
  const { data } = args;
  try {
    const response = await api.post(`/Patient/SavePatientSettings`, data);
    return response.data;
  } catch (error) {
    console.error('Error occurred while saving patient settings', error);
    throw error;
  }
});

export const getPatientSettings = createAsyncThunk('settings/getPatientSettings', async (args) => {
  const { patientID } = args;

  try {
    const response = await api.get(`/Patient/GetPatientSettings/${patientID}`);
    return response.data;
  } catch (error) {
    console.error('Error occurred while getting patient settings', error);
    throw error;
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    updateEulaData: null,
    savePatientSettingsData: null,
    getPatientSettingsData: null,
    updateEulaStatus: 'idle',
    savePatientSettingsStatus: 'idle',
    getPatientSettingsStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateEula.pending, (state) => {
        state.updateEulaStatus = 'loading';
      })
      .addCase(updateEula.fulfilled, (state, action) => {
        state.updateEulaStatus = 'succeeded';
        state.updateEulaData = action.payload;
      })
      .addCase(updateEula.rejected, (state, action) => {
        state.updateEulaStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(savePatientSettings.pending, (state) => {
        state.savePatientSettingsStatus = 'loading';
      })
      .addCase(savePatientSettings.fulfilled, (state, action) => {
        state.savePatientSettingsStatus = 'succeeded';
        state.savePatientSettingsData = action.payload;
      })
      .addCase(savePatientSettings.rejected, (state, action) => {
        state.savePatientSettingsStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(getPatientSettings.pending, (state) => {
        state.getPatientSettingsStatus = 'loading';
      })
      .addCase(getPatientSettings.fulfilled, (state, action) => {
        state.getPatientSettingsStatus = 'succeeded';
        state.getPatientSettingsData = action.payload;
      })
      .addCase(getPatientSettings.rejected, (state, action) => {
        state.getPatientSettingsStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export default settingsSlice.reducer;
