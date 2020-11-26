import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import ScoreBoard from './scoreBoard';
import Field from './field';

function MatchDetail(props) {
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

MatchDetail.propTypes = {
  'match': PropTypes.object.isRequired,
  'match.params.code': PropTypes.number,
};
export default MatchDetail;
