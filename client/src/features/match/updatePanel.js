import React, {Fragment} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  selectCurrentSelectedAgent,
  selectMatch,
  selectMatchStagingMoves,
  selectUpdateMessage,
  selectMatchDetail,
  updateMatchActions,
  updateStagingMoves,
  solveRandom,
  solvePython,
  selectMatchSolver,
  setSolveMethod,
  setAutoPlay,
} from './matchSlice';
import {Form, Table, Col} from 'react-bootstrap';
import PropTypes from 'prop-types';
import {MoveTypes, SolveMethod} from '../../utils/constants';
import Spinning from '../../assets/images/Ellipsis-1s-37px.svg';


function UpdatePanel() {
  const matchStagingMoves = useSelector(selectMatchStagingMoves);
  const matchID = useSelector(selectMatch).code;
  const dispatch = useDispatch();
  const updateMessage = useSelector(selectUpdateMessage);
  const matchDetail = useSelector(selectMatchDetail);

  const update = () => {
    dispatch(updateMatchActions(matchID, matchStagingMoves));
  };

  const solveRandomAction = () => {
    dispatch(solveRandom({
      agents: matchStagingMoves,
    }));
  };

  const solvePythonAction = (type) => {
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
      turn: matchDetail.turns - matchDetail.turn + 1,
    }, type));
  };

  return (
    <div className="row">
      <div className="col-sm-12">
        <div className="">
          <a className="btn btn-success" onClick={update}>
            <i className="far fa-edit"></i>
            {' Update'}
          </a>
          <a className="btn btn-info ml-1" onClick={solveRandomAction}>
            <i className="far fa-dice"></i>
            {' Random'}
          </a>
          <a className="btn btn-info ml-1" onClick={() => solvePythonAction(2)}>
            <i className="far fa-star"></i>
            {' Smart'}
          </a>
          <a className="btn btn-info ml-1" onClick={() => solvePythonAction(1)}>
            <i className="far fa-head-side-brain"></i>
            {' More smart'}
          </a>
        </div>
      </div>

      <SolverManager />

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

function SolverManager(props) {
  // const dispatch = useDispatch();
  const solver = useSelector(selectMatchSolver);
  const dispatch = useDispatch();

  return (
    <Fragment>
      <div className="col-sm-12 mt-1 mb-1">
        <Form>
          <Form.Row className="align-items-center">
            <Col xs="auto" className="my-1 mt-auto">
              <Form.Label
                className="mt-auto"
                htmlFor="inlineFormCustomSelect">
                Default method
              </Form.Label>
            </Col>
            <Col xs="auto" className="my-1">
              <Form.Control
                as="select"
                id="inlineFormCustomSelect"
                value={solver.method}
                onChange={(e) =>
                  dispatch(setSolveMethod(parseInt(e.target.value)))}
                custom
              >
                <option value={SolveMethod.NONE}>None</option>
                <option value={SolveMethod.RANDOM}>Random</option>
                <option value={SolveMethod.SMART}>Smart</option>
                <option value={SolveMethod.MORE_SMART}>More smart</option>
              </Form.Control>
            </Col>
            <Col xs="auto" className="my-1">
              <Form.Check
                type="checkbox"
                id="customControlAutosizing"
                label="Autoplay"
                checked={solver.autoPlay}
                onChange={(e) => dispatch(setAutoPlay(e.target.checked))}
                custom
              />
            </Col>
          </Form.Row>
        </Form>
      </div>

      <div className="col-sm-12 mt-1 mb-1 text-center solving">
        {solver.solving ?
          <span>
            <img src={Spinning} alt="spinning"/>
          &ensp;Solving
          </span> :
          (<span>&ensp;</span>) }
      </div>
    </Fragment>


  );
}

export default UpdatePanel;
