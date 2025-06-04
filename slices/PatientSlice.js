import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../Api';

export const getPatient = createAsyncThunk('patient/getPatient', async (args) => {
  const { patientID } = args;

  try {
    const response = await api.get(`/Patient/GetPatient/${patientID}`);
    return response.data;
  } catch (error) {
    console.error('Error while getting patient ', error);
    throw error;
  }
});

const userSlice = createSlice({
  name: 'patient',
  initialState: {
    getPatientData: null,
    getPatientStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPatient.pending, (state) => {
        state.getPatientStatus = 'loading';
      })
      .addCase(getPatient.fulfilled, (state, action) => {
        state.getPatientStatus = 'succeeded';
        state.getPatientData = action.payload;
      })
      .addCase(getPatient.rejected, (state, action) => {
        state.getPatientStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
