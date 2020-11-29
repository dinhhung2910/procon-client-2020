import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {selectCurrentSelectedAgent, selectMatch, selectMatchStagingMoves,
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

      {
        updateMessage.map((en) => {
          return (
            <div className="col-sm-12 mt-2" key={en.id}>
              <div className={`alert alert-${en.type}`}>
                {en.message}
              </div>
            </div>
          );
        })
      }

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
  const currentAgent = useSelector(selectCurrentSelectedAgent);

  const dispatch = useDispatch();
  const agentStatus = stagingMoves.find((en) => en.agentID == agentID) || {};
  const isSelected = (currentAgent.id == agentID);

  const onChange = (e) => {
    dispatch(updateStagingMoves({
      ...agentStatus,
      [e.target.name]: e.target.type == 'number' ?
        parseInt(e.target.value) : e.target.value,
    },
    ));
  };

  let badge = null;
  switch (agentStatus.type) {
  case (MoveTypes.MOVE):
    badge = (<span className="badge badge-success">MOVE</span>); break;
  case (MoveTypes.STAY):
    badge = (<span className="badge badge-warning">STAY</span>); break;
  case (MoveTypes.REMOVE):
    badge = (<span className="badge badge-danger">REMOVE</span>); break;
  default:
    badge = (<span className="badge badge-success">MOVE</span>); break;
  }

  return (
    <tr className={isSelected ? 'row-selected' : ''}>
      <td>
        {agentID}&emsp;{badge}
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
