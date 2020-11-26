import {createSlice} from '@reduxjs/toolkit';
import setAuthToken from '../../utils/setAuthToken';
import axios from 'axios';
import {MoveTypes} from '../../utils/constants';

export const matchSlice = createSlice({
  name: 'match',
  initialState: {
    detail: {
      blueTeam: {
        agents: [],
      },
      redTeam: {},
    },
    status: {
      type: 'none',
      remaining: 0,
    },
    stagingMoves: [],
    loaded: false,
    code: -1,
    updateMessage: {
      type: 'none',
      message: '',
    },
  },
  reducers: {
    matchLoaded: (state, action) => {
      let blueTeam = {agents: []}; let redTeam = {};
      let stagingMoves = [];

      try {
        blueTeam = action.payload.detail.teams.find((t) =>
          t.teamID == action.payload.detail.teamID,
        );
        redTeam = action.payload.detail.teams.find((t) =>
          t.teamID != action.payload.detail.teamID,
        );
      } catch (e) {
        blueTeam = {
          agents: [],
        };
        redTeam = {};
      }

      try {
        if (state.code != action.payload.detail.id) {
          stagingMoves = blueTeam.agents.map((item) => ({
            agentID: item.agentID,
            x: item.x,
            y: item.y,
            dx: 0,
            dy: 0,
            type: MoveTypes.MOVE,
          }));
          state.stagingMoves = stagingMoves;
        }
      } catch (e) {
        console.warn(e);
      }


      state.detail = {
        ...action.payload.detail,
        blueTeam,
        redTeam,
      };
      state.loaded = true;
      state.code = action.payload.detail.id;
    },
    updateStatus: (state, action) => {
      state.status = action.payload;
    },
    updateStagingMoves: (state, action) => {
      const agentStaging = state.stagingMoves.find((en) =>
        en.agentID == action.payload.agentID) || {};
      const agentCurrent = state.detail.blueTeam.agents.find((en) =>
        en.agentID == action.payload.agentID) || {};

      if (action.payload.type == MoveTypes.STAY) {
        agentStaging.dx = 0;
        agentStaging.dy = 0;
        agentStaging.x = agentCurrent.x;
        agentStaging.y = agentCurrent.y;
      } else {
        agentStaging.dx = action.payload.dx;
        agentStaging.dy = action.payload.dy;
        agentStaging.x = agentCurrent.x + action.payload.dx;
        agentStaging.y = agentCurrent.y + action.payload.dy;
      }

      agentStaging.type = action.payload.type;
    },
    updateAllStagingMoves: (state) => {
      state.detail.blueTeam.agents.forEach((agent) => {
        const agentStaging = state.stagingMoves.find((en) =>
          en.agentID == agent.agentID) || {};

        agentStaging.x = agent.x + agentStaging.dx;
        agentStaging.y = agent.y + agentStaging.dy;
      });
    },
    setUpdateMessage: (state, action) => {
      state.updateMessage = {
        type: action.payload.type,
        message: action.payload.message,
      };
    },
    clearUpdateMessage: (state) => {
      state.updateMessage = {
        type: 'none',
        message: '',
      };
    },
  },
});

export const {
  matchLoaded,
  updateStatus,
  updateStagingMoves,
  updateAllStagingMoves,
  setUpdateMessage,
  clearUpdateMessage,
} = matchSlice.actions;

// THUNKS

/**
 * Take token from localstorage to perform authenticating
 * @param {Number} code match's code
 * @return {*} nothing
 */
export const loadMatchByCode = (code) => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/matches/' + code);
    dispatch(matchLoaded({detail: res.data}));
    setTimeout(() => {
      dispatch(updateAllStagingMoves());
    }, 100);
  } catch (error) {
    // dispatch(removeAuth());
  }
};

export const updateMatchActions = (matchID, actions) => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }
  const config = {
    headers: {'Content-Type': 'application/json'},
  };
  const body = {
    actions,
  };
  try {
    await axios.post('/api/matches/' + matchID + '/action',
      JSON.stringify(body),
      config);
    dispatch(setUpdateMessage({
      type: 'success',
      message: 'Updated success',
    }));
  } catch (error) {
    dispatch(setUpdateMessage({
      type: 'error',
      message: error,
    }));
  }
  setTimeout(() => {
    dispatch(clearUpdateMessage());
  }, 5000);
};

export const selectMatch = (state) => state.match;
export const selectMatchDetail = (state) => state.match.detail;
export const selectMatchStatus = (state) => state.match.status;
export const selectMatchStagingMoves = (state) => state.match.stagingMoves;
export const selectUpdateMessage = (state) => state.match.updateMessage;

export default matchSlice.reducer;
