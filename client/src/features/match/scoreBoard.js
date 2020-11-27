import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {loadMatchByCode, selectMatch, selectMatchStatus} from './matchSlice';

export default function ScoreBoard() {
  const match = useSelector(selectMatch).detail;
  const status = useSelector(selectMatchStatus);
  const dispatch = useDispatch();

  const blueTeam = match.blueTeam || {};
  const redTeam = match.redTeam || {};

  const statusTextClass = '';
  const bluePoint = blueTeam.tilePoint + blueTeam.areaPoint;
  const redPoint = redTeam.tilePoint + redTeam.areaPoint;

  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-4">
          <div className="float-sm-left text-center text-primary">
            <div className="h4">
              Team {blueTeam.teamID}
            </div>
            <div className="h1 text-bold">
              {isNaN(bluePoint) ? 'N/A' : bluePoint}
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="text-center">
            <div className="h4 text-secondary">
              Turn: {match.turn} / {match.turns}
              {' '}
              {/* Button refresh */}
              <a className="btn btn-primary btn-sm"
                onClick={() => dispatch(loadMatchByCode(match.id))}>
                <i className="far fa-sync"></i>
              </a>

            </div>
            <div className={`h1 text-bold ${statusTextClass}`}>
              {status.type}
              {
                status.type != 'ended' ?
                  `:   ${parseInt(status.remaining / 1000)}s` :
                  ''
              }
            </div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="float-sm-right text-center text-danger">
            <div className="h4">
              Team {redTeam.teamID}
            </div>
            <div className="h1 text-bold">
              {isNaN(redPoint) ? 'N/A' : redPoint}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
