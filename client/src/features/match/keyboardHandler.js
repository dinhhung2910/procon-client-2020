import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {MoveTypes} from '../../utils/constants';
import {
  loadMatchByCode,
  selectCurrentSelectedAgent,
  selectMatch,
  selectMatchDetail,
  selectMatchStagingMoves,
  selectNextAgent,
  selectPreviousAgent,
  solvePython,
  solveRandom,
  updateMatchActions,
  updateStagingMoves,
} from './matchSlice';

/**
 * Add event listeners to handler keyboard event
 * Used for quick navigate between agents and move them
 * @return {null}
 */
function KeyboardHandler() {
  const dispatch = useDispatch();
  const selectedAgent = useSelector(selectCurrentSelectedAgent);
  const stagingMoves = useSelector(selectMatchStagingMoves);
  const match = useSelector(selectMatch);
  const matchDetail = useSelector(selectMatchDetail);

  const agent = stagingMoves.find((en) => en.agentID == selectedAgent.id) || {};

  const eventListener = function(e) {
    dispatch(() => {});
    switch (e.key) {
    case 'Tab': {
      if (e.shiftKey) {
        dispatch(selectPreviousAgent());
      } else {
        dispatch(selectNextAgent());
      }
      e.preventDefault();
      break;
    }
    case ' ': {
      let nextType = agent.type;
      let dx = agent.dx;
      let dy = agent.dy;

      switch (agent.type) {
      case MoveTypes.MOVE:
      case MoveTypes.REMOVE:
        dx = 0;
        dy = 0;
        nextType = MoveTypes.STAY; break;
      case MoveTypes.STAY:
        dx = 0;
        dy = 1;
        break;
      default: nextType = MoveTypes.MOVE; break;
      }
      dispatch(updateStagingMoves({
        ...agent,
        dx,
        dy,
        type: nextType,
      }));
      e.preventDefault();
      break;
    }

    // MOVE KEYS

    case 'ArrowUp':
    case 'w':
    {
      const dy = Math.max(agent.dy - 1, -1);
      dispatch(updateStagingMoves({
        ...agent,
        dy,
      }));
      e.preventDefault();
      break;
    }
    case 'ArrowDown':
    case 's':
    {
      const dy = Math.min(agent.dy + 1, 1);
      dispatch(updateStagingMoves({
        ...agent,
        dy,
      }));
      e.preventDefault();
      break;
    }
    case 'ArrowLeft':
    case 'a':
    {
      const dx = Math.max(agent.dx - 1, -1);
      dispatch(updateStagingMoves({
        ...agent,
        dx,
      }));
      e.preventDefault();
      break;
    }
    case 'ArrowRight':
    case 'd':
    {
      const dx = Math.min(agent.dx + 1, 1);
      dispatch(updateStagingMoves({
        ...agent,
        dx,
      }));
      e.preventDefault();
      break;
    }

    // END MOVE KEYS

    // REFRESH MAP
    case 'r': {
      dispatch(loadMatchByCode(match.code));
      break;
    }

    // SEND FORM
    case 'Enter': {
      dispatch(updateMatchActions(match.code, stagingMoves));
      break;
    }

    // RANDOMLY SOLVE
    case 'z': {
      dispatch(solveRandom({agents: stagingMoves}));
    }

    // SMART 1 SOLVE
    case 'x': {
      dispatch(solvePython({
        points: matchDetail.points,
        width: parseInt(matchDetail.width),
        height: parseInt(matchDetail.height),
        treasure: matchDetail.treasure,
        obstacles: matchDetail.obstacles,
        thisAgents: matchDetail.blueTeam.agents,
        thatAgents: matchDetail.redTeam.agents,
        tiled: matchDetail.tiled,
        teamID: matchDetail.teamID,
        turn: matchDetail.turns - matchDetail.turn,
      }, 2));
    }


    // MORE SMART
    case 'c': {
      dispatch(solvePython({
        points: matchDetail.points,
        width: parseInt(matchDetail.width),
        height: parseInt(matchDetail.height),
        treasure: matchDetail.treasure,
        obstacles: matchDetail.obstacles,
        thisAgents: matchDetail.blueTeam.agents,
        thatAgents: matchDetail.redTeam.agents,
        tiled: matchDetail.tiled,
        teamID: matchDetail.teamID,
        turn: matchDetail.turns - matchDetail.turn,
      }, 1));
    }

    default: {
      // console.log(e);
    }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', eventListener);
    return (() => {
      document.removeEventListener('keydown', eventListener);
    });
  }, [agent]);
  return null;
}

export default KeyboardHandler;
