import React, {Fragment, useState} from 'react';
import PropTypes from 'prop-types';
import {Form, Col, Button, Row} from 'react-bootstrap';
import {createMatch} from './listMatchesSlice';
import {useDispatch} from 'react-redux';

function CreateMatch(props) {
  const successCallback = (typeof props.onSuccess === 'function') ?
    props.onSuccess : () => {};
  const cancelCallback = (typeof props.onCancel === 'function') ?
    props.onCancel : () => {};
  const dispatch = useDispatch();

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createMatch(data));
    if (result) {
      successCallback();
    } else {
      cancelCallback();
    }
  };

  const [data, setData] = useState({
    width: 10,
    height: 10,
    startAt: new Date(new Date().setMinutes(new Date().getMinutes() + 5)).
      toISOString(),
    redTeamCode: 1,
    blueTeamCode: 2,
    intervalMillis: 15000,
    turnMillis: 15000,
  });

  const onChange = (e) => {
    let value = e.target.value;
    if (e.target.type === 'number') {
      value = parseInt(value);
    }

    setData({
      ...data,
      [e.target.name]: value,
    });
  };
  return (
    <Fragment>
      <Form onSubmit={(e) => onSubmit(e)}>
        <Form.Group as={Row}>
          <Form.Label column sm={2}>
            Size
          </Form.Label>
          <Col sm={5}>
            <Form.Control
              type="number"
              placeholder="Width"
              name="width"
              value={data.width}
              onChange={(e) => onChange(e)}
            />
          </Col>
          <Col sm={5}>
            <Form.Control
              type="number"
              placeholder="height"
              name="height"
              value={data.height}
              onChange={(e) => onChange(e)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <Form.Label column sm={2}>
            Blue team
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="number"
              value={data.blueTeamCode}
              placeholder="Blue team's code"
              onChange={(e) => onChange(e)}
              name="blueTeamCode" />
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <Form.Label column sm={2}>
            Red team
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="number"
              value={data.redTeamCode}
              placeholder="Red team's code"
              onChange={(e) => onChange(e)}
              name="redTeamCode" />
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <Form.Label column sm={2}>
            Interval time (ms)
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="number"
              value={data.intervalMillis}
              placeholder="Interval time (milliseconds)"
              onChange={(e) => onChange(e)}
              name="intervalMillis" />
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <Form.Label column sm={2}>
            Turn time (ms)
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="number"
              value={data.turnMillis}
              placeholder="Turn time (milliseconds)"
              onChange={(e) => onChange(e)}
              name="turnMillis" />
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <Form.Label column sm={2}>
            Start at
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              value={data.startAt}
              placeholder="Start at"
              onChange={(e) => onChange(e)}
              name="startAt" />
          </Col>
        </Form.Group>

        <Form.Group as={Row}>
          <Col sm={{span: 10, offset: 2}}>
            <Button type="submit">Create</Button>
            <a type="cancel"
              className="ml-1 btn btn-outline-danger"
              onClick={(e) => successCallback()}>
              Cancel
            </a>
          </Col>
        </Form.Group>
      </Form>
    </Fragment>
  );
}

CreateMatch.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default CreateMatch;
