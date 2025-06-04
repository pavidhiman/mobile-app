import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../Api';
import * as Amplitude from '@amplitude/analytics-react-native';

export const canCompleteSurvey = createAsyncThunk('survey/canCompleteSurvey', async (args) => {
  const { patientID, surveyID } = args;

  try {
    const response = await api.get(`/Survey/CanCompleteSurvey/${patientID}/${surveyID}`);
    return response.data;
  } catch (error) {
    Amplitude.logEvent('GET_CAN_COMPLETE_SURVEY_ERROR', {
      'error': error,
    });
    console.error('Error while getting canCompleteSurvey ', error);
    throw error;
  }
});

export const getSurveys = createAsyncThunk('survey/getSurvey', async (args) => {
  const { patientID } = args;

  try {
    const response = await api.get(`/Patient/GetAvailableSurveys/${patientID}`);
    return response.data;
  } catch (error) {
    console.error('Error while getting surveys ', error);
    throw error;
  }
});

export const getLatestSurvey = createAsyncThunk('survey/getPatientLatestSurvey', async (args) => {
  const { patientID } = args;

  try {
    const response = await api.get(`/survey/getPatientLatestSurvey/${patientID}`);
    return response.data;
  } catch (error) {
    console.error('Error while getting latest survey ', error);
    throw error;
  }
});

export const getSurveyQuestions = createAsyncThunk('survey/getSurveyComponents', async (args) => {
  const { surveyID } = args;

  try {
    const response = await api.get(`/survey/getsurveycomponents/${surveyID}/10000`);
    return response.data;
  } catch (error) {
    Amplitude.logEvent('GET_SURVEY_COMPONENTS_ERROR', {
      'error': error,
    });
    console.error('Error while getting survey components ', error);
    throw error;
  }
});

export const saveSurveyDetails = createAsyncThunk('survey/savePatientSurvey', async (args) => {
  const { data } = args;

  try {
    const response = await api.post(`/survey/savePatientSurvey`, data);
    return response.data;
  } catch (error) {
    console.error('Error occurred while saving patient survey details', error.response);
    throw error;
  }
});

export const saveSurveyAnswers = createAsyncThunk('survey/savePatientSurveyAnswer', async (args) => {
  const { data } = args;

  try {
    const response = await api.post(`/survey/savePatientSurveyAnswer`, data);
    return response.data;
  } catch (error) {
    console.error('Error occurred while saving patient survey answers', error.response);
    throw error;
  }
});

export const getSurveyAnswers = createAsyncThunk('survey/getSurveyAnswers', async (args) => {
  const { surveyID } = args;

  try {
    const response = await api.get(`/survey/getsurveyanswers/${surveyID}/10000`);
    return response.data;
  } catch (error) {
    Amplitude.logEvent('GET_SURVEY_ANSWERS_ERROR', {
      'error': error,
    });
    console.error('Error while getting survey components ', error);
    throw error;
  }
});

export const getOneYrSurveys = createAsyncThunk('survey/getOneYrSurveys', async (args) => {
  const { patientID } = args;

  try {
    const response = await api.get(`/survey/getoneyrsurveys/${patientID}`);
    return response.data;
  } catch (error) {
    console.error('Error in getOneYrSurveys (SurveySlice)', error);
    throw error;
  }
});

export const getPatientSurveyAnswerList = createAsyncThunk('survey/getpatientsurveyanswerlist', async (args) => {
  const { patientSurveyID } = args;

  try {
    const response = await api.get(`/survey/getpatientsurveyanswerlist/${patientSurveyID}`);
    return response.data;
  } catch (error) {
    console.error('Error in getPatientSurveyAnswerList (SurveySlice)', error);
    throw error;
  }
});

const surveySlice = createSlice({
  name: 'surveys',
  initialState: {
    getSurveyQuestionsData: null,
    getSurveysData: null,
    getSurveyAnswersData: null,
    saveSurveyDetailsData: null,
    saveSurveyAnswersData: null,
    getLatestSurveyData: null,
    surveyStartTime: null,
    canCompleteSurveyData: null,
    getOneYrSurveysData: [],
    getPatientSurveyAnswerListData: [],
    getSurveyQuestionsStatus: 'idle',
    getSurveysStatus: 'idle',
    getSurveyAnswersStatus: 'idle',
    saveSurveyDetailsStatus: 'idle',
    saveSurveyAnswersStatus: 'idle',
    getLatestSurveyStatus: 'idle',
    getOneYrSurveysStatus: 'idle',
    getPatientSurveyAnswerList: 'idle',
    canCompleteSurveyStatus: 'idle',
    error: null,
  },
  reducers: {
    resetCanCompleteSurveyState: (state) => {
      state.canCompleteSurveyData = null;
      state.canCompleteSurveyStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //getSurveys
      .addCase(getSurveys.pending, (state) => {
        state.getSurveysStatus = 'loading';
      })
      .addCase(getSurveys.fulfilled, (state, action) => {
        state.getSurveysStatus = 'succeeded';
        state.getSurveysData = action.payload;
      })
      .addCase(getSurveys.rejected, (state, action) => {
        state.getSurveysStatus = 'failed';
        state.error = action.error.message;
      })
      //getSurveyQuestions
      .addCase(getSurveyQuestions.pending, (state) => {
        state.getSurveyQuestionsStatus = 'loading';
      })
      .addCase(getSurveyQuestions.fulfilled, (state, action) => {
        state.getSurveyQuestionsStatus = 'succeeded';
        state.getSurveyQuestionsData = action.payload;
      })
      .addCase(getSurveyQuestions.rejected, (state, action) => {
        state.getSurveyQuestionsStatus = 'failed';
        state.error = action.error.message;
      })
      // getSurveyAnswers
      .addCase(getSurveyAnswers.pending, (state) => {
        state.getSurveyAnswersStatus = 'loading';
      })
      .addCase(getSurveyAnswers.fulfilled, (state, action) => {
        state.getSurveyAnswersStatus = 'succeeded';
        state.getSurveyAnswersData = action.payload;
      })
      .addCase(getSurveyAnswers.rejected, (state, action) => {
        state.getSurveyAnswersStatus = 'failed';
        state.error = action.error.message;
      })
      // saveSurveyDetails
      .addCase(saveSurveyDetails.pending, (state) => {
        state.saveSurveyDetailsStatus = 'loading';
      })
      .addCase(saveSurveyDetails.fulfilled, (state, action) => {
        state.saveSurveyDetailsStatus = 'succeeded';
        state.saveSurveyDetailsData = action.payload;
      })
      .addCase(saveSurveyDetails.rejected, (state, action) => {
        state.saveSurveyDetailsStatus = 'failed';
        state.error = action.error.message;
      })
      // saveSurveyDetails
      .addCase(getLatestSurvey.pending, (state) => {
        state.getLatestSurveyStatus = 'loading';
      })
      .addCase(getLatestSurvey.fulfilled, (state, action) => {
        state.getLatestSurveyStatus = 'succeeded';
        state.getLatestSurveyData = action.payload;
      })
      .addCase(getLatestSurvey.rejected, (state, action) => {
        state.getLatestSurveyStatus = 'failed';
        state.error = action.error.message;
      })
      // saveSurveyAnswers
      .addCase(saveSurveyAnswers.pending, (state) => {
        state.saveSurveyAnswersStatus = 'loading';
      })
      .addCase(saveSurveyAnswers.fulfilled, (state, action) => {
        state.saveSurveyAnswersStatus = 'succeeded';
        state.saveSurveyAnswersData = action.payload;
      })
      .addCase(saveSurveyAnswers.rejected, (state, action) => {
        state.saveSurveyAnswersStatus = 'failed';
        state.error = action.error.message;
      })
      // getOneYrSurveys
      .addCase(getOneYrSurveys.pending, (state) => {
        state.getOneYrSurveysStatus = 'loading';
      })
      .addCase(getOneYrSurveys.fulfilled, (state, action) => {
        state.getOneYrSurveysStatus = 'succeeded';
        state.getOneYrSurveysData = action.payload;
      })
      .addCase(getOneYrSurveys.rejected, (state, action) => {
        state.getOneYrSurveysStatus = 'failed';
        state.error = action.error.message;
      })
      // getPatientSurveyAnswerList
      .addCase(getPatientSurveyAnswerList.pending, (state) => {
        state.getPatientSurveyAnswerListStatus = 'loading';
      })
      .addCase(getPatientSurveyAnswerList.fulfilled, (state, action) => {
        state.getPatientSurveyAnswerListStatus = 'succeeded';
        state.getPatientSurveyAnswerListData = action.payload;
      })
      .addCase(getPatientSurveyAnswerList.rejected, (state, action) => {
        state.getPatientSurveyAnswerListStatus = 'failed';
        state.error = action.error.message;
      })

      .addCase(canCompleteSurvey.pending, (state) => {
        state.canCompleteSurveyStatus = 'loading';
      })
      .addCase(canCompleteSurvey.fulfilled, (state, action) => {
        state.canCompleteSurveyStatus = 'succeeded';
        state.canCompleteSurveyData = action.payload;
      })
      .addCase(canCompleteSurvey.rejected, (state, action) => {
        state.canCompleteSurveyStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { resetCanCompleteSurveyState } = surveySlice.actions;
export default surveySlice.reducer;
