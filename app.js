require('dotenv').config();
const express = require('express');
const api = require('./api');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log('header 1')
  res.header('Access-Control-Allow-Origin', '*');
  console.log('header 2')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  console.log('header 3')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  console.log('header 4')
  next();
});

app.use('/', api);

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).json({ error: 'Note not found' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid json' });
  }

  return res.status(500).json({ error: err.detail });
}

app.use(notFoundHandler);
app.use(errorHandler);

const {
  PORT: port = 3000,
  HOST: host = '127.0.0.1',
} = process.env;

app.listen(port, () => {
  console.info(`Server running at http://${host}:${port}/`);
});
