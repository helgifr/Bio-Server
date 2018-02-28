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

  const list = await getToken()
    .then((token) => getMovieList(token));

  return res.json(list);
}

async function getMovieList(token) {
  console.log(token);
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
    res.on('data', function(chunk) {
      console.log(chunk.toString());

      return JSON.parse(chunk);
    });
  });
  req.end();
}

async function getToken() {
  // const { id } = req.params;
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
      console.log(chunk.toString());

      return JSON.parse(chunk).token;
    })
  });

  request.end(body);
}

router.get('/', catchErrors(getMovies));

module.exports = router;
