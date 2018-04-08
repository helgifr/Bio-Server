const express = require('express');

const http = require('http');

const {
  getToken,
  delToken,
  setToken,
} = require('./db');

const router = express.Router();

async function getMovieList(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.kvikmyndir.is',
      port: 80,
      path: '/movies',
      method: 'GET',
      headers: {
        'x-access-token': token,
      },
      dataType: 'json',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(data.toString()));
      });
    });
    req.end();
  });
}

async function fetchToken() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ username: 'snati', password: 'helgigummi' });
    const options = {
      hostname: 'api.kvikmyndir.is',
      port: 80,
      path: '/authenticate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      dataType: 'json',
    };
    const request = http.request(options, (response) => {
      response.on('data', (chunk) => {
        resolve(JSON.parse(chunk.toString()).token);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.end(body);
  });
}

async function getMovies(req, res) {
  const data = await getToken();
  let token;
  let date;
  if (data === undefined) {
    console.info('Fetching token for the first time...');
    try {
      token = await fetchToken();
    } catch (err) {
      console.error('Unable to fetch token');
      return res.status(503).send('The api is down');
    }
    date = new Date();
    await setToken(token, date);
  } else {
    ({ token, date } = data);
    if (Date.now() - date > 86400000) {
      console.info('Token expired. Fetching new token...');
      await delToken();
      try {
        token = await fetchToken();
      } catch (err) {
        console.error('Cant fetch token');
        return res.status(503).send('The api is down');
      }
      date = new Date();
      await setToken(token, date);
    }
  }

  const list = await getMovieList(token);

  return res.json(list);
}

async function authenticate(req, res, next) {
  const token = req.headers.authorization;
  if (token === 'Bearer Kappa') {
    return next();
  }
  return res.json({ error: 'Invalid token' });
}

router.get('/', authenticate, getMovies);

module.exports = router;
