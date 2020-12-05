import React, {Fragment, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import ReactHelmet from 'react-helmet';
import MatchDetail from '../../features/match/match';
import {
  loadMatchByCode,
  updateStatus,
  selectMatchDetail} from '../../features/match/matchSlice';
import UpdatePanel from '../../features/match/updatePanel';
import KeyboardHandler from '../../features/match/keyboardHandler';

function Match(props) {
  const code = props.match.params.code;
  const dispatch = useDispatch();
  const matchDetail = useSelector(selectMatchDetail);
  const [loop, setLoop] = useState(0);
  let _loop = 0;

  useEffect(() => {
    const interval = setInterval(() => {
      _loop++;
      setLoop(_loop);
    }, 200);
    return () => {
      clearInterval(interval);
    };
  }, []);

  /* refresh map each 400ms */
  useEffect(() => {
    // first turn is zero
    const endTime =
        matchDetail.startedAtUnixTime +
        (matchDetail.turns + 2) *
        (matchDetail.turnMillis + matchDetail.intervalMillis);
    const current = new Date().getTime();

    if (current > endTime) {
      dispatch(updateStatus({
        'type': 'ended',
        'remaining': 0,
        'turn': matchDetail.turns,
      }));
    } else if (current < matchDetail.startedAtUnixTime) {
      dispatch(updateStatus({
        'type': 'early',
        'remaining': 0,
        'turn': 0,
      }));
    } else {
      const roundTime = (current - matchDetail.startedAtUnixTime) %
        (matchDetail.turnMillis + matchDetail.intervalMillis);

      const turn = Math.floor((current - matchDetail.startedAtUnixTime) /
        (matchDetail.turnMillis + matchDetail.intervalMillis)) + 1;

      if (roundTime > matchDetail.turnMillis) {
        dispatch(updateStatus({
          type: 'interval',
          remaining: matchDetail.turnMillis + matchDetail.intervalMillis -
              roundTime,
          turn,
        }));
      } else {
        dispatch(updateStatus({
          type: 'turn',
          remaining: matchDetail.turnMillis - roundTime,
          turn,
        }));
      }
    }
  }, [loop]);

  useEffect(() => {
    dispatch(loadMatchByCode(code));
  }, []);

  // refetch each 2000ms
  useEffect(() => {
    const _interval = setInterval(() => {
      dispatch(loadMatchByCode(code));
    }, 2000);
    return () => {
      clearInterval(_interval);
    };
  }, []);

  return (
    <Fragment>
      <ReactHelmet>
        <title>{`Match ${matchDetail.id} | ${matchDetail.matchTo}`}
        </title>
      </ReactHelmet>
      <KeyboardHandler />
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-md-8">
            <MatchDetail />
          </div>
          <div className="col-md-4">
            <UpdatePanel />
          </div>
        </div>
      </div>

    </Fragment>
  );
}

Match.propTypes = {
  'match': PropTypes.object.isRequired,
  'match.params.code': PropTypes.number,
};
export default Match;
