import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {selectAuth} from '../../features/login/loginSlice';

function PrivatedRoute(props) {
  const auth = useSelector(selectAuth);
  const {component: Component, ...rest} = props;

  if (!auth.isAuthenticated && !auth.loading) {
    return (<Route {...rest} render={() => (<Redirect to='/login'/>)} />);
  }

  return (
    <Route {...rest} render={(props) => (<Component {...props} />)} />
  );
}

PrivatedRoute.propTypes = {
  component: PropTypes.object,
};

export default PrivatedRoute;
