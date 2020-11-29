const path = require('path');

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
      console.log(data.toString());
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

module.exports = {
  solveRandom,
};
