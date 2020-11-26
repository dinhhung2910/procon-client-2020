import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {selectMatch, selectMatchStagingMoves,
  selectUpdateMessage,
  updateMatchActions,
  updateStagingMoves} from './matchSlice';
import {Form, Table} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {MoveTypes} from '../../utils/constants';

function UpdatePanel() {
  const matchStagingMoves = useSelector(selectMatchStagingMoves);
  const matchID = useSelector(selectMatch).code;
  const dispatch = useDispatch();
  const updateMessage = useSelector(selectUpdateMessage);

  const update = () => {
    dispatch(updateMatchActions(matchID, matchStagingMoves));
  };

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="">
          <a className="btn btn-success" onClick={update}>
            <i className="far fa-edit"></i>
            {' Update'}
          </a>
        </div>
      </div>

      {updateMessage.type != 'none' ?
        (<div className="col-sm-12 mt-2">
          <div className="alert alert-warning">
            {updateMessage.message}
          </div>
        </div>) : null}

      <div className="col-sm-12 mt-1">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Agent ID</th>
              <th>Type</th>
              <th>dx</th>
              <th>dy</th>
            </tr>
          </thead>
          <tbody>
            {matchStagingMoves.map((en) =>
              (<UpdateAgent key={en.agentID} agentID={en.agentID} />))}
          </tbody>
        </Table>

      </div>
    </div>
  );
}

function UpdateAgent(props) {
  const {agentID} = props;
  // const
  const stagingMoves = useSelector(selectMatchStagingMoves);

  const dispatch = useDispatch();
  const agentStatus = stagingMoves.find((en) => en.agentID == agentID) || {};

  const onChange = (e) => {
    dispatch(updateStagingMoves({
      ...agentStatus,
      [e.target.name]: e.target.type == 'number' ?
        parseInt(e.target.value) : e.target.value,
    },
    ));
  };

  return (
    <tr>
      <td>
        {agentID}
      </td>
      <td>
        <Form.Control
          as="select"
          name="type"
          onChange={(e) => onChange(e)}
          value={agentStatus.type}
          placeholder="Type">
          {Object.values(MoveTypes).map((en) => (
            <option key={en}>{en}</option>
          ))}
        </Form.Control>
      </td>
      <td>
        <Form.Control
          type="number"
          min="-1"
          max="1"
          name="dx"
          onChange={(e)=>onChange(e)}
          step="1"
          placeholder="dx"
          value={agentStatus.dx}/>
      </td>
      <td>
        <Form.Control
          type="number"
          min="-1"
          max="1"
          name="dy"
          onChange={(e)=>onChange(e)}
          step="1"
          placeholder="dy"
          value={agentStatus.dy}/>
      </td>


    </tr>

  );
}

UpdateAgent.propTypes = {
  agentID: PropTypes.number.isRequired,
};

export default UpdatePanel;
