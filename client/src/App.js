import React, {Fragment, useEffect} from 'react';
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom';
import ReactHelmet from 'react-helmet';
import {Counter} from './features/counter/Counter';
import './styles/vendor.scss';
import './styles/site.scss';
import Login from './components/containers/login';
import {loadUser} from './features/login/loginSlice';
import {useDispatch} from 'react-redux';
import Matches from './components/containers/matches';
import NavigationBar from './components/navbar';
import PrivatedRoute from './components/route/privatedRoute';
import Home from './components/containers/home';
import Match from './components/containers/match';

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadUser());
  }, []);

  return (
    <Fragment>
      <ReactHelmet>
        <title>Procon 2020 | HUST</title>
      </ReactHelmet>
      <Router>
        <Switch>
          <Route path="/login" exact component={Login}></Route>
          <Route path="/counter" exact component={Counter}></Route>
          <PrivatedRoute path="*" component={DefaultComponent} />
        </Switch>
      </Router>
    </Fragment>
  );
}

const DefaultComponent = (props) => {
  return (
    <Fragment>
      <NavigationBar />
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/matches" exact component={Matches}></Route>
        <Route path="/matches/:code" exact component={Match} />
      </Switch>
    </Fragment>
  );
};

export default App;
