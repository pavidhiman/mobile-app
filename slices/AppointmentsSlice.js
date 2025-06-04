import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../Api';

export const getPatientAppointments = createAsyncThunk('appts/getPatientAppointments', async (args) => {
  const { patientID } = args;

  try {
    const response = await api.get(`/Patient/getPatientAppointments/${patientID}`);
    return response.data;
  } catch (error) {
    console.error('Error while getting patient appointments ', error);
    throw error;
  }
});

export const getAvailableApptSlots = createAsyncThunk('appts/getAvailableApptSlots', async (args) => {
  const { locationID, year, month, day } = args;

  try {
    const response = await api.get(`/Clinic/getAvailableApptSlots/${locationID}/${year}/${month}/${day}/1`);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(error.response.data);
    }
    console.error('Error while getting available appointment slots ', error);
    throw error;
  }
});

export const saveAppointment = createAsyncThunk('appts/saveAppointment', async (args) => {
  const { appointmentData } = args;

  try {
    const response = await api.post(`/Patient/saveAppointment`, appointmentData);
    return response.data;
  } catch (error) {
    console.error('Error while saving appointment', error);
    throw error;
  }
});

export const deleteAppointment = createAsyncThunk('appts/deleteAppointment', async (args) => {
  const { patientAppointmentID, accessToken } = args;

  try {
    const response = await api.delete(`/Patient/DeleteAppointment/${patientAppointmentID}`);
    return response.data;
  } catch (error) {
    console.error('Error while deleting appointment', error);
  }
});

const apptsSlice = createSlice({
  name: 'appts',
  initialState: {
    getApptsData: null,
    saveApptsData: null,
    deleteApptsData: null,
    getAvailApptSlotsData: null,
    getApptsStatus: 'idle',
    saveApptsStatus: 'idle',
    deleteApptsStatus: 'idle',
    getAvailApptSlotsStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPatientAppointments.pending, (state) => {
        state.getApptsStatus = 'loading';
      })
      .addCase(getPatientAppointments.fulfilled, (state, action) => {
        state.getApptsStatus = 'succeeded';
        state.getApptsData = action.payload;
      })
      .addCase(getPatientAppointments.rejected, (state, action) => {
        state.getApptsStatus = 'failed';
        state.error = action.error.message;
      })

      // Handling saveAppointment states
      .addCase(saveAppointment.pending, (state) => {
        state.saveApptsStatus = 'loading';
      })
      .addCase(saveAppointment.fulfilled, (state, action) => {
        state.saveApptsStatus = 'succeeded';
        state.saveApptsData = action.payload;
      })
      .addCase(saveAppointment.rejected, (state, action) => {
        state.saveApptsStatus = 'failed';
        state.error = action.error.message;
      })

      .addCase(deleteAppointment.pending, (state) => {
        state.deleteApptsStatus = 'loading';
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.getApptsData = state.getApptsData.filter(
          (appt) => appt.patientAppointmentID !== action.payload.patientAppointmentID,
        );
        state.deleteApptsStatus = 'succeeded';
        state.deleteApptsData = action.payload;
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.deleteApptsStatus = 'failed';
        state.error = action.error.message;
      })

      .addCase(getAvailableApptSlots.pending, (state) => {
        state.getAvailApptSlotsStatus = 'loading';
      })
      .addCase(getAvailableApptSlots.fulfilled, (state, action) => {
        state.getAvailApptSlotsStatus = 'succeeded';
        state.getAvailApptSlotsData = action.payload;
      })
      .addCase(getAvailableApptSlots.rejected, (state, action) => {
        state.getAvailApptSlotsStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export default apptsSlice.reducer;
