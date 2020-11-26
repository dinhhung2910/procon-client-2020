import React, {Fragment} from 'react';
import ReactHelmet from 'react-helmet';
import {useSelector} from 'react-redux';
import {Redirect} from 'react-router-dom';
import LoginForm from '../../features/login/login';
import {selectAuth} from '../../features/login/loginSlice';

function Login() {
  const auth = useSelector(selectAuth);

  if (!auth.isLoading && auth.isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <Fragment>
      <ReactHelmet>
        <title>Sign in</title>
      </ReactHelmet>
      <LoginForm />
    </Fragment>

  );
}

export default Login;
