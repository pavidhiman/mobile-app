import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../Api';

export const getConditions = createAsyncThunk('conditions/getConditions', async () => {
  try {
    const response = await api.get(`/Patient/GetConditions`);
    return response.data;
  } catch (error) {
    console.error('Error occurred while getting conditions', error);
    throw error;
  }
});

const conditionsSlice = createSlice({
  name: 'conditions',
  initialState: {
    getConditionsData: null,
    getConditionsStatus: 'idle',
    error: null,
    selectedCondition: [],
  },
  reducers: {
    setSelectedConditionRedux: (state, action) => {
      state.selectedCondition = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConditions.pending, (state) => {
        state.getConditionsStatus = 'loading';
      })
      .addCase(getConditions.fulfilled, (state, action) => {
        state.getConditionsStatus = 'succeeded';
        state.getConditionsData = action.payload;
      })
      .addCase(getConditions.rejected, (state, action) => {
        state.getConditionsStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setSelectedConditionRedux } = conditionsSlice.actions;

export default conditionsSlice.reducer;
