import {createSlice} from '@reduxjs/toolkit';
import setAuthToken from '../../utils/setAuthToken';
import axios from 'axios';

export const listMatchesSlice = createSlice({
  name: 'listMatches',
  initialState: {
    loaded: false,
    list: [],
  },
  reducers: {
    listMatchesLoaded: (state, action) => {
      state.list = action.payload;
      state.loaded = true;
    },
  },
});

export const {
  listMatchesLoaded,
} = listMatchesSlice.actions;

// THUNKS

/**
 * Take token from localstorage to perform authenticating
 * @return {*} nothing
 */
export const loadAllMatches = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/matches');
    dispatch(listMatchesLoaded(res.data));
  } catch (error) {
    // dispatch(removeAuth());
  }
};

export const refresh = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }
  try {
    await axios.post('/api/matches');
    dispatch(loadAllMatches());
  } catch (error) {
    // dispatch(removeAuth());
  }
};

export const selectListMatches = (state) => state.listMatches;

export default listMatchesSlice.reducer;
