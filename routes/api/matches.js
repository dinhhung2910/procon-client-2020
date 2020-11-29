const express = require('express');
const router = express.Router();
const config = require('config');
const logger = require('../../logger/winston');
const axios = require('axios');

const server = config.get('server');
const db = require('../../config/db');
const {solveRandom} = require('../../utils/solver');

// @route GET api/auth/
// @desc  Get current logged in user
// @access Authenticated
router.get('/', async (req, res) => {
  const token = req.header('x-auth-token');
  try {
    const matches = db.get(token).value();
    res.json(matches || []);
  } catch (e) {
    logger.error(e);
    console.log(e.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/matches
// @desc Update matches from server

router.post('/', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    const config = {
      headers: {
        'token': token,
      },
      params: {
        'token': token,
      },
    };

    try {
      const result = await axios.get(`${server}/matches`, config);
      const matches = result.data;

      if (!db.has(token).value()) {
        db.set(token, []).write();
      }

      // token is the key for each team database
      matches.forEach((match) => {
        // check if match is existed?
        const existedMatch = db
          .get(token)
          .find({id: match.id})
          .cloneDeep()
          .value();

        if (existedMatch) {
          db.get(token).find({id: match.id}).assign(match).write();
        } else {
          db.get(token).push(match).write();
        }
      });

      return res.json(matches);
    } catch (e) {
      res.status(e.response.status).send(e.response.data.message);
    }
  } catch (e) {
    logger.error(e);
    console.log(e.message);
    res.status(500).send('Server error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    const config = {
      headers: {
        'token': token,
      },
      params: {
        'token': token,
      },
    };

    try {
      let match = await axios.get(
        `${server}/matches/${req.params.id}`,
        config,
      );
      match = match.data;

      const existedMatch = db
        .get(token)
        .find({id: parseInt(req.params.id)})
        .cloneDeep()
        .value();

      match = Object.assign(match, existedMatch);

      return res.json(match);
    } catch (e) {
      console.log(e);
      res.status(e.response.status).send(e.response.data.message);
    }
  } catch (e) {
    logger.error(e);
    console.log(e.message);
    res.status(500).send('Server error');
  }
});

/**
 * @description Update action for match
 */
router.post('/:id/action', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    const config = {
      headers: {
        'token': token,
        'Content-Type': 'application/json',
      },
      params: {
        'token': token,
      },
    };
    const body = {
      actions: req.body.actions,
    };

    try {
      await axios.post(
        `${server}/matches/${req.params.id}/action`,
        JSON.stringify(body),
        config,
      );
      return res.json('ok');
    } catch (e) {
      console.log(e);
      return res.status(e.response.status).send(e.response.data.message);
    }
  } catch (e) {
    logger.error(e);
    console.log(e.message);
    res.status(500).send('Server error');
  }
});

/**
 * @description Solve a map
 * execute locally
 */
router.post('/solve', async (req, res) => {
  try {
    const agents = req.body.agents;
    const result = await solveRandom({agents});
    res.json(result);
  } catch (err) {
    logger.error(err);
    console.log(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
