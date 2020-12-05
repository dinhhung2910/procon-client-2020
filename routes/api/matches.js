const express = require('express');
const router = express.Router();
const config = require('config');
const logger = require('../../logger/winston');
const axios = require('axios');

const server = config.get('server');
const db = require('../../config/db');
const {solveRandom, solvePython} = require('../../utils/solver');

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

      // remove deleted match
      const matchIds = matches.map((en) => en.id);
      db.get(token)
        .remove((en) => !matchIds.includes(en.id))
        .write();

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
      const current = new Date().getTime();
      // get saved match from db
      const savedMatch = db
        .get('matches')
        .find({id: parseInt(req.params.id)})
        .cloneDeep()
        .value();
      const existedMatch = db
        .get(token)
        .find({id: parseInt(req.params.id)})
        .cloneDeep()
        .value();

      let match = {};
      let needRefresh = false;

      if (!savedMatch) {
        needRefresh = true;
      } else {
        const fullTurnTime = existedMatch.intervalMillis +
          existedMatch.turnMillis;
        const nextTurn = savedMatch.startedAtUnixTime +
          (savedMatch.turn + 2) * fullTurnTime - existedMatch.intervalMillis;
        if (nextTurn - current < 0 && current - savedMatch.lastUpdate > 1500) {
          needRefresh = true;
        }
      }
      // only fetch from server if this match not existed in db
      // or this match is too old
      // or in interval time
      if (needRefresh) {
        match = await axios.get(
          `${server}/matches/${req.params.id}`,
          config,
        );
        match = match.data;
        match.id = parseInt(req.params.id);
        match.lastUpdate = current;

        // save to db
        if (!savedMatch) {
          db.get('matches').push(match).write();
        } else {
          db
            .get('matches')
            .find({id: parseInt(req.params.id)})
            .assign(match)
            .write();
        }
      } else {
        match = savedMatch;
      }

      match = Object.assign(match, existedMatch);

      // In this game
      // We always have an preparing turn
      // We call this turn -1
      if (current - match.startedAtUnixTime <
        (match.turnMillis + match.intervalMillis)) {
        match.turn = -1;
      }

      return res.json(match);
    } catch (e) {
      if (e.response && e.response.status == 429) {
        console.log('Get match: too many requests', req.params.id);
      } else {
        console.log(e);
      }
      res.status(e.response.status).send(e.response.data.message);
    }
  } catch (e) {
    logger.error(e);
    console.log(e.message);
    res.status(500).send('Server error');
  }
});

/**
 * @return {Promise}
 * @param {Number} id Match id
 * @param {String} token User's token
 * @param {*} data actions
 * @param {*} tried number of times tried
 */
function tryPostAction(id, token, data, tried = 0) {
  const status429 = {
    response: {
      status: 429,
      data: {
        message: 'Too many request',
      },
    },
  };
  return new Promise(async (resolve, reject) => {
    if (tried == 5) {
      console.log(429);
      return reject(status429);
    }
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
      actions: data,
    };

    try {
      await axios.post(
        `${server}/matches/${id}/action`,
        JSON.stringify(body),
        config,
      );
      resolve('ok');
    } catch (e) {
      // console.log(e);
      if (e.response && e.response.status == 429) {
        console.log('Resend in 200ms...', tried);
        setTimeout(() => {
          resolve(tryPostAction(id, token, data, tried + 1));
        }, 300);
      } else {
        reject(e);
      }
    }
  });
}

/**
 * @description Update action for match
 */
router.post('/:id/action', async (req, res) => {
  try {
    const token = req.header('x-auth-token');

    await tryPostAction(req.params.id, token, req.body.actions);
    res.json('ok');
  } catch (e) {
    logger.error(e);
    if (e.response && e.response.data) {
      console.log(e.response.data.message);
      return res.status(e.response.status).send(e.response.data.message);
    }
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

router.post('/solve-smart', async (req, res) => {
  try {
    const data = req.body.data;
    const result = await solvePython(data, 2);
    res.json(result);
  } catch (err) {
    logger.error(err);
    console.log(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/solve-more-smart', async (req, res) => {
  try {
    const data = req.body.data;
    const result = await solvePython(data, 1);
    res.json(result);
  } catch (err) {
    logger.error(err);
    console.log(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
