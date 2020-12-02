const path = require('path');
const generateInput = require('./generateInput');

/**
 * randomly generate output
 * @param {*} data input
 * @return {Promise}
 */
const solveRandom = (data) => {
  return new Promise((resolve, reject) => {
    const {spawn} = require('child_process');
    const agents = data.agents;

    const ids = agents.map((en) => en.agentID);
    const childProcess = spawn(
      path.resolve(global.__basedir, 'utils', 'random.out' ),
      ids,
    );

    childProcess.stdout.on('data', function(data) {
      // process returned data
      const result = data.toString().split(' ').map((en) => parseInt(en));

      const agents = [];
      const agentNum = result[0];

      for (let i = 0; i < agentNum; i++) {
        agents.push({
          agentID: result[i*3 + 1],
          dx: result[i*3 + 2],
          dy: result[i*3 + 3],
        });
      }

      resolve(agents);
    });
  });
};

const solvePython = (data) => {
  return new Promise(function(resolve, reject) {
    const file = generateInput(data);

    const {spawn} = require('child_process');
    const params = [
      // eslint-disable-next-line max-len
      path.resolve(global.__basedir, 'utils', 'ProCon_Interactive', 'main.py' ),
      '--file_name',
      file,
    ];

    const childProcess = spawn('python3',
      params,
    );

    childProcess.stdout.on('data', function(data) {
      // process returned data
      const result = JSON.parse(data.toString());

      const agents = result.map((en) => {
        return {
          agentID: en[0],
          dy: en[1][0],
          dx: en[1][1],
        };
      });

      resolve(agents);
    });
  });
};

module.exports = {
  solveRandom,
  solvePython,
};
