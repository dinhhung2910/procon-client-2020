const express = require('express');

const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const {parseFromFile} = require('./utils/generateInput');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`);
});

global.__basedir = __dirname;


// parseFromFile('/mnt/d/Dinh Hung/Documents/Workings/Procon 2020/procon-client-2020/test-map.json');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Init Middleware
app.use(express.json({extended: false}));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

// API ROUTES DEFINE HERE
app.use('/api/matches', require('./routes/api/matches'));
app.use('/api/auth', require('./routes/api/auth'));

app.use(express.static('client/build'));

// public route

app.get('*', (req, res) => {
  return res.sendFile(path.resolve(
    __dirname, 'client', 'build', 'index.html'),
  );
});

