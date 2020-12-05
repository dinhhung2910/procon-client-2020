import React, {Fragment, useState, useEffect} from 'react';
import {Button, Form} from 'react-bootstrap';
import {Helmet} from 'react-helmet';
import {useDispatch, useSelector} from 'react-redux';
import {saveSettings, selectSettings} from './settingsSlice';

function Settings() {
  const settings = useSelector(selectSettings);
  const [data, setData] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    setData(settings);
  }, [settings]);

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(saveSettings(data));
  };

  const onChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Fragment>
      <Helmet>
        <title>Settings | Procon 2020</title>
      </Helmet>
      <Form onSubmit={onSubmit} >
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Solver server</Form.Label>
          <Form.Control type="text"
            name="solveServer"
            onChange={onChange}
            value={data.solveServer}
            placeholder="Enter email" />
          <Form.Text className="text-muted">
            {'Server that solve match.'}
          </Form.Text>
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Fragment>

  );
}

export default Settings;
