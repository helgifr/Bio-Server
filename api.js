const express = require('express');
// const xss = require('xss');

// const { check, validationResult } = require('express-validator/check');
// const { sanitize } = require('express-validator/filter');

const request = require('ajax-request');

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
  // const { id } = req.params;

  const token = await request({
    url: 'http://api.biomynd.is/authenticate',
    type: 'POST',
    data: {
      username: 'snati', // VANTAR
      password: 'helgigummi', // VANTAR
    },
  }, (error, response, body) => ({ err: error, res: response, body }));
  console.log('token:', token);
  console.log('err:', token.err);
  console.log('res:', token.res);
  console.log('body:', token.body);
  return res.json(token.body);
  /*
  const data = await request({
    url: 'http://api.biomynd.is/movies',
    type: 'GET',
    headers: {
      'x-access-token': token,
    },
  }, (error, response, body) => ({ err: error, res: response, body }));
  console.log('data:', data);
  console.log('err:', data.err);
  console.log('res:', data.res);
  console.log('body:', data.body);

  return res.json(data.body);*/
}

router.get('/', catchErrors(getMovies));

module.exports = router;
