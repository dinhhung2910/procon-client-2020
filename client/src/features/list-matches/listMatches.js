/* eslint-disable react/prop-types */
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {loadAllMatches, selectListMatches} from './listMatchesSlice';
import {Link} from 'react-router-dom';


function ListMatches() {
  const matches = useSelector(selectListMatches);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!matches.loaded) {
      dispatch(loadAllMatches());
    }
  }, []);

  return (
    <div className="col-md-12">

      <form>
        <table className="table table-bordered table-condensed table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Match name</th>
              <th>Turns</th>
              <th>Turn time</th>
              <th>Interval time</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="form-list-client-body">
            {matches.list.map((item) => (<Row data={item} key={item.id}/>))}
          </tbody>
        </table>
      </form>
    </div>
  );
}

const Row = ({data}) => {
  return (
    <tr>
      <td>{data.id}</td>
      <td>{data.matchTo} </td>
      <td>{data.turns}</td>
      <td>{parseInt(data.turnMillis / 1000)}s</td>
      <td>{parseInt(data.intervalMillis / 1000)}s</td>
      <td>
        <Link
          to={`/matches/${data.id}`}
          className="btn btn-outline-primary btn-sm">
          <i className="fal fa-eye"></i>
        </Link>
      </td>
    </tr>
  );
};

export default ListMatches;
