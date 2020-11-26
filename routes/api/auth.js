const express = require('express');
const router = express.Router();
const {validationResult, check} = require('express-validator');

const config = require('config');
const logger = require('../../logger/winston');
const axios = require('axios');
const server = config.get('server');

// @route   POST api/admin/auth/
// @desc    Log admin user in
// @access  Public
router.post(
  '/',
  [
    check('token', 'Token is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    try {
      const {token} = req.body;
      const config = {
        headers: {
          'token': token,
        },
        params: {
          'token': token,
        },
      };

      try {
        await axios.get(`${server}/matches`, config);
        return res.json({
          token,
        });
      } catch (e) {
        res.status(e.response.status).send(e.response.data.message);
      }
    } catch (e) {
      // Something went wrong
      logger.error(e);
      res.status(500).send('Server error');
    }
  },
);

router.get('/', async (req, res) => {
  try {
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
        await axios.get(`${server}/matches`, config);
        const user = {
          username: 'admin',
          name: 'Admin',
          _id: 0,
        };

        res.json(user);
      } catch (e) {
        res.status(e.response.status).send(e.response.data.message);
      }
    } catch (e) {
      // Something went wrong
      logger.error(e);
      res.status(500).send('Server error');
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).send('Server error');
    logger.error(e);
  }
});

module.exports = router;
