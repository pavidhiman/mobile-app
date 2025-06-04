import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAccessToken, getRefreshToken } from '../utils/Library';

export const fetchAccessToken = createAsyncThunk('auth/fetchAccessToken', async () => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Access token not found');
  }
  return token;
});

export const fetchRefreshToken = createAsyncThunk('auth/fetchRefreshToken', async () => {
  const token = await getRefreshToken();
  if (!token) {
    throw new Error('Refresh token not found');
  }
  return token;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: null,
    refreshToken: null,
    accessTokenStatus: 'idle',
    refreshTokenStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccessToken.pending, (state) => {
        state.accessTokenStatus = 'loading';
      })
      .addCase(fetchAccessToken.fulfilled, (state, action) => {
        state.accessTokenStatus = 'succeeded';
        state.accessToken = action.payload;
      })
      .addCase(fetchAccessToken.rejected, (state, action) => {
        state.accessTokenStatus = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchRefreshToken.pending, (state) => {
        state.refreshTokenStatus = 'loading';
      })
      .addCase(fetchRefreshToken.fulfilled, (state, action) => {
        state.refreshTokenStatus = 'succeeded';
        state.refreshToken = action.payload;
      })
      .addCase(fetchRefreshToken.rejected, (state, action) => {
        state.refreshTokenStatus = 'failed';
        state.error = action.error.message;
      });
  },
});

export default authSlice.reducer;
