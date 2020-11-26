import React, {Fragment} from 'react';
import ReactHelmet from 'react-helmet';
import ListMatches from '../../features/list-matches/listMatches';
import {useDispatch} from 'react-redux';
import {refresh} from '../../features/list-matches/listMatchesSlice';

function Matches() {
  const dispatch = useDispatch();

  return (
    <Fragment>
      <ReactHelmet>
        <title>List matches</title>
      </ReactHelmet>
      <div className="container-fluid">
        {/* LEGEND */}
        <div className="row mt-3">
          <div className="col-md-6">
            <legend>List of matches</legend>
          </div>
          <div className="col-md-6 flex-right">
            <a className="btn btn-default-btn-xs btn-primary mr-1"
              onClick={() => {
                dispatch(refresh());
              }}>
              <i className="far fa-sync"></i>
              {'  Refresh'}
            </a>
          </div>
        </div>
        <hr className="mt-0 mb-4" style={{width: '100%'}}></hr>
        <ListMatches />
      </div>
    </Fragment>
  );
}

export default Matches;
