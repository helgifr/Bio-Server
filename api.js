const express = require('express');
const xss = require('xss');

const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const axios = require('axios');
const http = require('http');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const {
  addUser,
  findUserByUsername,
  getToken,
  delToken,
  setToken,
} = require('./db');

const router = express.Router();

const formValidation = [
  check('username')
  .custom(string => (string.length >= 3) && (typeof string === 'string'))
    .withMessage('Title must be a string of length 1 to 255 characters'),
  check('password')
    .custom(string => (string.length >= 3) && (typeof string === 'string')),
  sanitize('username').trim(),
];

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function getMovies(req, res, next) {
  const data = await getToken();
  let token, date;
  if (data === undefined) {
    console.info('Fetching token for the first time...');
    token = await fetchToken();
    date = new Date();
    await setToken(token, date);
  } else {
    ({ token, date } = data);
    if (Date.now() - date > 86400000) {
      console.log(Date.now() - date);
      console.info('Token expired. Fetching new token...');
      const result = await delToken();
      token = await fetchToken();
      date = new Date();
      await setToken(token, date);
    }
  }

  const list = await getMovieList(token);

  return res.json(list);
}

async function getMovieList(token) {
  return new Promise ((resolve) => {
  const options = {
    hostname: 'api.kvikmyndir.is',
    port: 80,
    path: "/movies",
    method: "GET",
    headers: {
        'x-access-token': token,
    },
    dataType: 'json'
  }

  const req = http.request(options, function(res) {
    let data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function() {
      resolve(JSON.parse(data.toString()));
    });
  });
  req.end();
});
}

async function fetchToken() {
  return new Promise ((resolve, reject) => {
  var body = JSON.stringify({ 'username': 'snati', 'password': 'helgigummi' });
  const options = {
    hostname: 'api.kvikmyndir.is',
    port: 80,
    path: "/authenticate",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
    },
    dataType: 'json'
  }
  var request = http.request(options, function(response) {
    response.on('data', function(chunk) {
      resolve(JSON.parse(chunk.toString()).token);
    })
  });

  request.end(body);
});
}

async function movie(token, id) {
  return new Promise ((resolve, reject) => {
    const options = {
      hostname: 'api.kvikmyndir.is',
      port: 80,
      path: "/movies",
      method: "GET",
      headers: {
          'x-access-token': token,
      },
      dataType: 'json'
    }
  
    const req = http.request(options, function(res) {
      let data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        resolve(JSON.parse(data.toString()));
      });
    });
    req.end();
  });
}

async function register(req, res, next) {
  const {
    username,
    password,
  } = req.body;

  let hash = xss(password);
  hash = await bcrypt.hash(hash, saltRounds);

  const user = {
    username: xss(username),
    password: xss(hash),
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errorsArray = validation.array();
    const errors = errorsArray.map(i => ({ field: i.param, message: i.msg }));
    return res.status(400).json(errors);
  }


  return addUser(user)
    .then((data) => {
      if (data) {
        return res.status(200).json(data);
      }
      return next();
    })
    .catch((error) => {
      return next(error);
    });
}

async function login(req, res) {
  const { username, password } = req.body;

  const user = await findUserByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'No such user' });
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (passwordIsCorrect) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid password' });
}

router.get('/', catchErrors(getMovies));
router.post('/register', catchErrors(register));
router.post('/login', catchErrors(login));

module.exports = router;
