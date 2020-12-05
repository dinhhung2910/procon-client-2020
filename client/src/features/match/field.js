/* eslint-disable react/prop-types */
import React, {Fragment, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {
  selectCurrentSelectedAgent,
  selectMatch,
  selectMatchStagingMoves,
  selectMatchStatus} from './matchSlice';
import fieldStyles from './field.module.scss';
import {ProgressBar} from 'react-bootstrap';

function Field() {
  const match = useSelector(selectMatch).detail;
  const status = useSelector(selectMatchStatus);
  let {height, width} = match;
  try {
    height = match.tiled.length;
    width = match.tiled[0].length;
  } catch (e) {
    console.warn(e);
  }
  // const {height, width} = match;


  const rows = [];

  for (let i = 0; i <height; i++) {
    rows.push(<FieldRow row={i+1} key={i+1} width={width}/>);
  }
  const progressValue = (status.type != 'turn' ?
    100 :
    status.remaining / match.turnMillis * 100);

  return (
    <div>
      <div className="field-progress-bar-container" style={{
        width: width*50+'px',
      }}>
        <ProgressBar now={progressValue} />
      </div>

      <table className={fieldStyles['field-table']}>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
}

function FieldRow(props) {
  const match = useSelector(selectMatch).detail;
  const {width, row} = props;
  const cells = [];


  for (let i = 0; i<width; i++) {
    const tiledValue = match.tiled[row - 1][i];
    const pointValue = match.points[row-1][i];


    cells.push(<FieldCell
      row={row}
      tiledValue={tiledValue}
      pointValue={pointValue}
      column={i+1}
      key={row*100 + i+1}/>);
  }

  return (
    <tr>
      {cells}
    </tr>
  );
}

function FieldCell(props) {
  const match = useSelector(selectMatch).detail;
  const blueTeam = match.blueTeam || {agents: []};
  const redTeam = match.redTeam || {agents: []};
  const walls = match.obstacles || [];
  const treasures = match.treasure || [];
  const stagingMoves = useSelector(selectMatchStagingMoves);
  const selectedAgent = useSelector(selectCurrentSelectedAgent);


  const {
    row,
    column,
    pointValue,
    tiledValue,
  } = props;

  const isWall = walls.find((en) => en.x == column && en.y == row);

  // check if cell is occupied by any team
  // In some case, an agent is still in this cell
  // But opponent removed this agent tile
  // So we still display that this cell is occupied by this agent
  const currentAgentBlue =
    blueTeam.agents.find((en) => en.x == column && en.y == row);
  const currentAgentRed =
    redTeam.agents.find((en) => en.x == column && en.y == row);
  const currentAgent = currentAgentBlue || currentAgentRed;

  const isBlue = (blueTeam.teamID === tiledValue) || currentAgentBlue;
  const isRed = (redTeam.teamID === tiledValue) || currentAgentRed;

  const isStaging = stagingMoves.find((en) => en.x == column && en.y == row);

  const isSelected = !currentAgent ? false :
    (currentAgent.agentID == selectedAgent.id);

  // check if this cell has treasure
  // and if it is occupied by any team?
  const treasure = treasures.find((en) => en.x == column && en.y == row);
  const treasureStatus = (!treasure ? 'none' : (
    treasure.status == 0 ? 'no-occupied' : (
      treasure.status == blueTeam.teamID ? 'blue-occupied' : (
        treasure.status == redTeam.teamID ? 'red-occupied' : 'none'
      )
    )
  ));

  useEffect(() => {

  }, [tiledValue]);

  return (
    <td className={fieldStyles['field-cell'] +
      (isWall ? (' ' + fieldStyles['field-cell-wall']) : '') +
      (isBlue ? (' ' + fieldStyles['field-cell-blue']) : '') +
      (isRed ? (' ' + fieldStyles['field-cell-red']) : '') +
      (isStaging ? (' ' + fieldStyles['field-cell-staging']) : '') +
      (isSelected ? (' ' + fieldStyles['field-cell-selected']) : '') +
      (currentAgent ? (' ' + fieldStyles['field-cell-current']) : '')
    }>
      {!isWall ? (
        <Fragment>
          <div className={fieldStyles['sub-cell-row']}>
            {/* Has an agent in it */}
            <div className={
              fieldStyles['current-agent-id'] + ' ' +
              fieldStyles['sub-cell']
            }>
              {currentAgent ? currentAgent.agentID : ''}
            </div>

            {/* Has treasure in it */}
            <div className={
              fieldStyles['sub-cell-treasure'] + ' ' +
              fieldStyles['sub-cell'] + ' ' +
              fieldStyles[treasureStatus]
            }>
              {treasure ? treasure.point : ''}
            </div>
          </div>
          <div className={fieldStyles['point-value']}>
            {pointValue}
          </div>
          <div className={fieldStyles['staging-overlay']}></div>
        </Fragment>
      ) :null}

    </td>);
}

export default Field;
