const {v4} = require('uuid');
const fs = require('fs');
const path = require('path');

const parseFromFile = (file) => {
  const buffer = fs.readFileSync(file);
  const data = JSON.parse(buffer);

  console.log(generateInput({
    points: data.points,
    tiled: data.tiled,
    width: parseInt(data.width),
    height: parseInt(data.height),
    treasure: data.treasure,
    turn: 30,
    thisAgents: data.teams[0].agents,
    thatAgents: data.teams[1].agents,
    obstacles: data.obstacles,
    teamID: 1,
  }));
};

/**
 *
 * @param {*} data input
 * @param {Number} data.width
 * @param {Number} data.height
 * @param {*} data.points point matrix
 * @param {*} data.tiled tiled status
 * @param {*} data.treasure treasure matrix
 * @param {Number} data.turn remaining turn
 * @param {*} data.thisAgents this team's agents
 * @param {*} data.thatAgents oponent team's agents
 * @param {*} data.obstacles walls
 * @return {String} filename
 */
const generateInput = (data) => {
  const {
    points,
    tiled,
    treasure,
    turn,
    teamID,
    thisAgents,
    thatAgents,
    width,
    height,
    obstacles,
  } = data;

  const filename = path.resolve(
    global.__basedir,
    'utils',
    'maps',
    v4() + '.txt',
  );
  let fileData = '';


  fileData += `${height} ${width}\n`;

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      fileData += (points[i][j] + ' ');
    }
    fileData += '\n';
  }

  const availableTreasure = treasure.filter((en) => en.status == 0);
  fileData += (availableTreasure.length + '\n');
  availableTreasure.forEach((en) => {
    fileData += `${en.y-1} ${en.x-1} ${en.point}\n`;
  });

  fileData += (obstacles.length + '\n');
  obstacles.forEach((en) => {
    fileData += `${en.y-1} ${en.x-1}\n`;
  });

  fileData += `${thisAgents.length}\n`;
  thisAgents.forEach((en) => {
    fileData += `${en.agentID} ${en.y-1} ${en.x-1}\n`;
  });
  thatAgents.forEach((en) => {
    fileData += `${en.agentID} ${en.y-1} ${en.x-1}\n`;
  });

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (tiled[i][j] == teamID) {
        fileData += '1 ';
      } else {
        fileData += '0 ';
      }
    }
    fileData += '\n';
  }

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (tiled[i][j] == teamID || tiled[i][j] == 0) {
        fileData += '0 ';
      } else {
        fileData += '1 ';
      }
    }
    fileData += '\n';
  }

  fileData += turn;

  fs.writeFileSync(filename, fileData);
  return filename;
};

module.exports = {generateInput, parseFromFile};
