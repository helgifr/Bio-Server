const express = require('express');

const http = require('http');
const fetch = require('node-fetch');

const {
  getToken,
  delToken,
  setToken,
} = require('./db');

const router = express.Router();

async function getMovieList(token) {
  return fetch('http://api.kvikmyndir.is/movies', { port: 80,
      
      method: 'GET',
      headers: {
        'x-access-token': typeof token === 'string' ? token : JSON.parse(token).token,
      },
      dataType: 'json',
    })
    .then(res => res.json())
    .then(body => body)
    .catch(err => console.error(err))
}

async function getUpcomingMovieList(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.kvikmyndir.is',
      port: 80,
      path: '/upcoming',
      method: 'GET',
      headers: {
        'x-access-token': typeof token === 'string' ? token : JSON.parse(token).token,
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
  const body = JSON.stringify({ username: 'snati', password: 'helgigummi' });
   return fetch('http://api.kvikmyndir.is/authenticate', { port: 80,
      
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      dataType: 'json',
    })
    .then(res => res.json())
    .then(body => body.token)
    .catch(err => console.error(err))
  
//   return new Promise((resolve, reject) => {
//     const body = JSON.stringify({ username: 'snati', password: 'helgigummi' });
//     const options = {
//       hostname: 'api.kvikmyndir.is',
//       port: 80,
//       path: '/authenticate',
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Content-Length': Buffer.byteLength(body),
//       },
//       dataType: 'json',
//     };
//     const request = http.request(options, (response) => {
//       response.on('data', (chunk) => {
//         resolve(JSON.parse(chunk.toString()).token);
//       });
//     });

//     request.on('error', (err) => {
//       reject(err);
//     });

//     request.end(body);
//   });
}

async function getMovies(req, res) {
  const data = await getToken();
  console.info('token', data);
  let token;
  let date;
  if (data === undefined || !data.token) {
    console.info('Fetching token for the first time...');
    try {
      token = await fetchToken();
      console.info('token 2', token);
    } catch (err) {
      console.error('Unable to fetch token');
      return res.status(503).send('The api is down');
    }
    date = new Date();
    await setToken(token, date);
  } else {
    ({ token, date } = data);
    console.info(Date.now() - date);
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

async function getUpcomingMovies(req, res) {
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
    console.info(Date.now() - date);
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
  
  const list = await getUpcomingMovieList(token);

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
router.get('/upcoming', authenticate, getUpcomingMovies);

module.exports = router;
