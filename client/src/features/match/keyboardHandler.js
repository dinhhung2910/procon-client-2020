import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {MoveTypes} from '../../utils/constants';
import {
  loadMatchByCode,
  selectCurrentSelectedAgent,
  selectMatch,
  selectMatchStagingMoves,
  selectNextAgent,
  selectPreviousAgent,
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
      let nextType = MoveTypes.MOVE;
      switch (agent.type) {
      case MoveTypes.MOVE: nextType = MoveTypes.REMOVE; break;
      case MoveTypes.REMOVE: nextType = MoveTypes.STAY; break;
      case MoveTypes.STAY: nextType = MoveTypes.MOVE; break;
      default: nextType = MoveTypes.MOVE; break;
      }
      dispatch(updateStagingMoves({
        ...agent,
        type: nextType,
      }));
      break;
    }

    // MOVE KEYS

    case 'ArrowUp': {
      const dy = Math.max(agent.dy - 1, -1);
      dispatch(updateStagingMoves({
        ...agent,
        dy,
      }));
      e.preventDefault();
      break;
    }
    case 'ArrowDown': {
      const dy = Math.min(agent.dy + 1, 1);
      dispatch(updateStagingMoves({
        ...agent,
        dy,
      }));
      e.preventDefault();
      break;
    }
    case 'ArrowLeft': {
      const dx = Math.max(agent.dx - 1, -1);
      dispatch(updateStagingMoves({
        ...agent,
        dx,
      }));
      e.preventDefault();
      break;
    }
    case 'ArrowRight': {
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

    default: {
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
