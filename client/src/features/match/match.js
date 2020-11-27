import React, {Fragment} from 'react';
import ScoreBoard from './scoreBoard';
import Field from './field';

function MatchDetail() {
  return (
    <Fragment>
      <div>
        <ScoreBoard />
      </div>
      <div>
        <Field />
      </div>
    </Fragment>
  );
}

export default MatchDetail;
