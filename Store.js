import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import validUserReducer from './slices/ValidUserSlice';
import userReducer from './slices/UserSlice';
import locationsReducer from './slices/LocationsSlice';
import conditionsReducer from './slices/ConditionsSlice';
import settingsReducer from './slices/PatientSettingsSlice';
import authReducer from './slices/AuthSlice';
import surveysReducer from './slices/SurveySlice';
import apptsReducer from './slices/AppointmentsSlice';
import pushTokenReducer from './slices/PushTokenSlice';
import assessmentsReducer from './slices/AssessmentSlice';

const appReducer = combineReducers({
  validUser: validUserReducer,
  user: userReducer,
  locations: locationsReducer,
  conditions: conditionsReducer,
  settings: settingsReducer,
  auth: authReducer,
  surveys: surveysReducer,
  appts: apptsReducer,
  pushToken: pushTokenReducer,
  assessments: assessmentsReducer,
});

const initialState = appReducer({}, {});

const rootReducer = (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    state = initialState;
  }

  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
