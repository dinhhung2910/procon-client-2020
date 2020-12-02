import {createSlice} from '@reduxjs/toolkit';
import setAuthToken from '../../utils/setAuthToken';
import axios from 'axios';
import {MoveTypes, SolveMethod} from '../../utils/constants';
import {v4 as uuid} from 'uuid';
// import store from '../../app/store';

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
    solver: {
      solving: false,
      method: localStorage.getItem('solveMethod') || SolveMethod.NONE,
      autoPlay: localStorage.getItem('autoPlay') == 'true' || false,
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

    setSolving: (state) => {
      state.solver.solving = true;
    },
    clearSolving: (state) => {
      state.solver.solving = false;
    },
    setSolveMethod: (state, action) => {
      state.solver.method = action.payload;
      localStorage.setItem('solveMethod', action.payload);
    },
    setAutoPlay: (state, action) => {
      state.solver.autoPlay = action.payload;
      localStorage.setItem('autoPlay', action.payload);
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
  setSolving,
  clearSolving,
  setSolveMethod,
  setAutoPlay,
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
    const store = await import('../../app/store');
    const oldMatch = store.default.getState().match;

    const res = await axios.get('/api/matches/' + code);
    let needGenerateNewMoves = false;
    // check if new turn
    if (oldMatch.detail.turn != res.data.turn) {
      // auto generate new move
      needGenerateNewMoves = true;
    }

    dispatch(matchLoaded({detail: res.data}));

    setTimeout(() => {
      dispatch(updateAllStagingMoves());
    }, 100);
    if (needGenerateNewMoves) {
      setTimeout(async () => {
        await dispatch(applyMoves(oldMatch.solver.method));
        // check if autp play
        if (oldMatch.solver.autoPlay) {
          const _store = await import('../../app/store');
          const _newMatch = _store.default.getState().match;
          dispatch(updateMatchActions(
            oldMatch.detail.id,
            _newMatch.stagingMoves),
          );
        }
      }, 100);
    }
  } catch (error) {
    // dispatch(removeAuth());
    console.error(error);
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
    dispatch(setSolving());
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
  } finally {
    dispatch(clearSolving());
  }
};

/**
 * @param {SolveMethod} method solver method
 * @param {*} match match detail
 * @return {*}
 */
export const applyMoves = (method) => async (dispatch) => {
  const store = await import('../../app/store');
  const match = store.default.getState().match.detail;
  switch (parseInt(method)) {
  case (SolveMethod.NONE): {
    const result = match.blueTeam.agents.map((en) => ({
      agentID: en.agentID,
      dx: 0,
      dy: 0,
    }));
    result.forEach((en) => dispatch(updateStagingMoves(en)));
    break;
  }
  case (SolveMethod.RANDOM): {
    await dispatch(solveRandom({
      agents: match.blueTeam.agents,
    }));
    break;
  }
  case (SolveMethod.SMART): {
    await dispatch(solvePython({
      points: match.points,
      width: parseInt(match.width),
      height: parseInt(match.height),
      treasure: match.treasure,
      obstacles: match.obstacles,
      thisAgents: match.blueTeam.agents,
      thatAgents: match.redTeam.agents,
      tiled: match.tiled,
      teamID: match.teamID,
      turn: match.turns - match.turn,
    }));
  }
  }
};

export const solvePython = (data) => async (dispatch) => {
  const config = {
    headers: {'Content-Type': 'application/json'},
  };
  const body = {
    data,
  };

  if (!data.turn) {
    return;
  }

  try {
    dispatch(setSolving());
    const result = await axios.post('/api/matches/solve-python',
      JSON.stringify(body),
      config);
    const data = await result.data;
    data.forEach((en) => {
      dispatch(updateStagingMoves(en));
    });

    dispatch(addMessage({
      type: 'info',
      message: 'Solved smartly',
    }));
  } catch (error) {
    dispatch(addMessage({
      type: 'danger',
      message: error.message,
    }));
  } finally {
    dispatch(clearSolving());
  }
};

export const test = (data) => async (dispatch) => {
  // console.log(store);
  const store = await import('../../app/store');
  const time = store.default.getState().match.detail.lastUpdate;
  console.log(store);
  console.log(time);
  console.log(data);
};

export const selectMatch = (state) => state.match;
export const selectMatchDetail = (state) => state.match.detail;
export const selectMatchStatus = (state) => state.match.status;
export const selectMatchStagingMoves = (state) => state.match.stagingMoves;
export const selectUpdateMessage = (state) => state.match.updateMessage;
export const selectCurrentSelectedAgent = (state) =>
  state.match.selectedAgent;
export const selectMatchSolver = (state) => state.match.solver;

export default matchSlice.reducer;
