import {createSlice} from '@reduxjs/toolkit';
import setAuthToken from '../../utils/setAuthToken';
import axios from 'axios';
import {MoveTypes} from '../../utils/constants';
import {v4 as uuid} from 'uuid';

export const matchSlice = createSlice({
  name: 'match',
  initialState: {
    detail: {
      blueTeam: {
        agents: [],
      },
      redTeam: {},
      tiled: [[]],
    },
    status: {
      type: 'none',
      remaining: 0,
    },
    stagingMoves: [],
    loaded: false,
    code: -1,
    updateMessage: [],
    selectedAgent: {
      index: -1,
      id: -1,
    },
  },
  reducers: {
    matchLoaded: (state, action) => {
      let blueTeam = {agents: []}; let redTeam = {};
      let stagingMoves = [];

      try {
        blueTeam = action.payload.detail.teams.find((t) =>
          t.teamID == action.payload.detail.teamID,
        ) || {agents: []};
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
          state.selectedAgent = {
            index: -1,
            id: -1,
          };
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

      if (action.payload.dx == 0 && action.payload.dy ==0) {
        agentStaging.type = MoveTypes.STAY;
      } else {
        const x = agentCurrent.x + action.payload.dx;
        const y = agentCurrent.y + action.payload.dy;
        // check if move or remove

        if (state.detail.tiled[y-1] != undefined &&
          state.detail.tiled[x-1] != undefined) {
          switch (state.detail.tiled[y-1][x-1]) {
          case 0:
          case state.detail.teamID:
            agentStaging.type = MoveTypes.MOVE;
            break;
          default:
            agentStaging.type = MoveTypes.REMOVE;
            break;
          }
        }
        agentStaging.x = x;
        agentStaging.y = y;
      }
      // update
      agentStaging.dx = action.payload.dx;
      agentStaging.dy = action.payload.dy;
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
      state.updateMessage = [
        {
          id: action.payload.id,
          type: action.payload.type,
          message: action.payload.message,
        },
        ...state.updateMessage,
      ];
    },
    clearUpdateMessage: (state, action) => {
      state.updateMessage = state.updateMessage.filter((en) =>
        en.id != action.payload);
    },
    selectNextAgent: (state) => {
      const agentNum = state.detail.blueTeam.agents.length;
      if (agentNum == 0) {
        return state.selectedAgent = {
          index: -1,
          id: -1,
        };
      }
      const nextAgentIndex = (state.selectedAgent.index + 1) % agentNum;
      state.selectedAgent = {
        index: nextAgentIndex,
        id: state.detail.blueTeam.agents[nextAgentIndex].agentID,
      };
    },
    selectPreviousAgent: (state) => {
      const agentNum = state.detail.blueTeam.agents.length;
      if (agentNum == 0) {
        return state.selectedAgent = {
          index: -1,
          id: -1,
        };
      }
      const nextIndex = (state.selectedAgent.index + agentNum - 1) % agentNum;
      state.selectedAgent = {
        index: nextIndex,
        id: state.detail.blueTeam.agents[nextIndex].agentID,
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
  selectNextAgent,
  selectPreviousAgent,
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
    dispatch(addMessage({
      type: 'success',
      message: 'Updated success',
    }));
  } catch (error) {
    dispatch(addMessage({
      type: 'danger',
      message: error.message,
    }));
  }
};

export const addMessage = (data) => (dispatch) => {
  const messageId = uuid();
  dispatch(setUpdateMessage({
    id: messageId,
    type: data.type,
    message: data.message,
  }));
  setTimeout(() => {
    dispatch(clearUpdateMessage(messageId));
  }, 2000);
};

export const solveRandom = ({agents}) => async (dispatch) => {
  const config = {
    headers: {'Content-Type': 'application/json'},
  };
  const body = {
    agents,
  };

  try {
    const result = await axios.post('/api/matches/solve',
      JSON.stringify(body),
      config);
    const data = await result.data;
    data.forEach((en) => {
      dispatch(updateStagingMoves(en));
    });

    dispatch(addMessage({
      type: 'info',
      message: 'Solved randomly',
    }));
  } catch (error) {
    dispatch(addMessage({
      type: 'danger',
      message: error.message,
    }));
  }
};

export const selectMatch = (state) => state.match;
export const selectMatchDetail = (state) => state.match.detail;
export const selectMatchStatus = (state) => state.match.status;
export const selectMatchStagingMoves = (state) => state.match.stagingMoves;
export const selectUpdateMessage = (state) => state.match.updateMessage;
export const selectCurrentSelectedAgent = (state) =>
  state.match.selectedAgent;

export default matchSlice.reducer;
