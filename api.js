const express = require('express');
// const xss = require('xss');

// const { check, validationResult } = require('express-validator/check');
// const { sanitize } = require('express-validator/filter');

var http = require('http');

const router = express.Router();

/*
const formValidation = [
  check('title')
    .custom(string => string.length > 0 && string.length < 256)
    .withMessage('Title must be a string of length 1 to 255 characters'),
  check('text')
    .exists().withMessage('Text must be a string'),
  check('datetime')
    .isISO8601().withMessage('Datetime must be a ISO 8601 date'),
  sanitize('title').trim(),
  sanitize('text'),
];
*/

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function getMovies(req, res, next) {

  console.log('list:');
  const token = await getToken();

  const list = await getMovieList(token);

  console.log(list[0]);

  return res.json(list);
}

async function getMovieList(token) {
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

async function getToken() {
  // const { id } = req.params;
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

/*async function getMovie(req, res, next) {
  const { id } = req.params;
  if (id >= 0) {
    const token = await getToken();

    const movie = await movie(token, id);

    res.json(movie);
  }
}*/

router.get('/', catchErrors(getMovies));
//router.get('/:id', catchErrors(getMovie));

module.exports = router;
