import {createSlice} from '@reduxjs/toolkit';
import setAuthToken from '../../utils/setAuthToken';
import axios from 'axios';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token'),
    // begin with null
    isAuthenticated: false,
    loading: true,
    // save all authenticated data here
    user: null,
    errors: [],
  },
  reducers: {
    userLoaded: (state, action) => {
      const {payload} = action;
      localStorage.setItem('user', JSON.stringify(payload.user));

      state.isAuthenticated = true;
      state.loading = false;
      state.user = payload.user;
    },
    // login to get token
    loginSuccess: (state, action) => {
      const {payload} = action;
      localStorage.setItem('token', payload.token);

      state.isAuthenticated = true;
      state.loading = false;
      state.token = payload.token;
    },
    removeAuth: (state) => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setErrors: (state, action) => {
      const {payload} = action;
      state.errors = payload.errors;
    },
  },
});

export const {
  userLoaded,
  loginSuccess,
  removeAuth,
  setErrors,
} = authSlice.actions;

// THUNKS

/**
 * Take token from localstorage to perform authenticating
 * @return {*} nothing
 */
export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/auth');
    dispatch(userLoaded(res.data));
  } catch (error) {
    dispatch(removeAuth());
  }
};

/**
 *
 * @param {*} param0 payload
 * @param {String} param0.username username
 * @param {String} param0.password password
 * @return {*} nothing
 */
export const login = ({token}) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({token});
  try {
    const res = await axios.post('/api/auth', body, config);

    await dispatch(loginSuccess(res.data));
    await dispatch(loadUser());
  } catch (err) {
    console.log(err.response);
    const errors = (err.response && err.response.data) ?
      (err.response.data.errors ?
        err.response.data.errors.map((en) => en.msg):
        [err.response.data]) :
      [];

    await dispatch(removeAuth());
    await dispatch(setErrors({errors}));
  }
};

export const logout = () => (dispatch) => {
  dispatch(removeAuth());
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
// export const selectCount = (state) => state.counter.value;

export const selectAuth = (state) => state.auth;

export default authSlice.reducer;
