const express = require('express');
// const xss = require('xss');

// const { check, validationResult } = require('express-validator/check');
// const { sanitize } = require('express-validator/filter');

//const request = require('request');
const axios = require('axios');
var http = require('http');
var token;

function postCode() {
var options = {
  host: 'api.biomynd.is',
  path: '/authenticate?username=snati&password=helgigummi',
  method: 'POST',
  data: {
    username: 'snati',
    password: 'helgigummi',
  },
  dataType: 'json',
};

var req = http.request(options, function(res) {

  console.log(res);
  
  res.setEncoding('utf-8');
  res.on('data', function (chunk) {
    console.log(chunk);
    
    //console.log(chunk.substring(chunk.search('API_SERVICE_INFO') + 19, chunk.search('ir.is/"}') + 8));
    //token = JSON.parse(chunk.substring(chunk.search('API_SERVICE_INFO') + 19, chunk.search('ir.is/"}') + 8));
    //getCode();
    
    //token = JSON.parse(chunk.substring(chunk.search('API_SERVICE_INFO') + 19, chunk.search('ir.is/"}') + 8));
    
  })

})

req.end();

}

function getCode() {
  console.log(token);
  
  var options = {
    host: 'api.biomynd.is',
    path: '/movies',
    type: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'x-access-token': token.token 
    },
    dataType: 'json',
  };
  
  var req = http.request(options, function(res) {
  
    //console.log(res);
    
    res.setEncoding('utf-8');
    res.on('data', function (chunk) {
      //console.log('Response: ' + chunk);
      
    })
  
  })
  
  req.end();
  
}
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

async function getMovies(req, res, next, token) {
  $.ajax({
    url: 'http://api.biomynd.is/movies',
    type: 'GET',
    headers: {
      'x-access-token': token,
    },
    dataType: 'json',
    success : function (response) {
      console.log(response);
      return res.send(body);
    }
  });
}

async function getToken(req, res, next) {
  // const { id } = req.params;
  var body = JSON.stringify({ 'username': 'snati', 'password': 'helgigummi' });
  const options = {
    hostname: 'api.biomynd.is',
    path: "/authenticate",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
    },
    dataType: 'json'
  }
  var request = http.request(options);

  request.end(body);
  
  request.on('connect', (reponse, socket, head) => {
    console.log('got connected!');
    
    socket.on('data', (chunk) => {
      console.log(chunk.toString());
      return res.send(chunk.toString());
    });
    socket.on('end', () => {
      proxy.close();
    });
  });

  /*
  request.post({
    uri: 'http://127.0.0.1:3000/h',
    form: obj,
    dataType: 'json',
  }, function (error, response, body) {
      //console.log(error);
      //console.log(response);
      //console.log(body);
      
      //const token = JSON.parse(body.substring(body.search('API_SERVICE_INFO') + 19, body.search('ir.is/"}') + 8));
      //return getMovies(req, res, next, token.token);

  });*/
  //postCode();
}

router.get('/', catchErrors(getToken));

module.exports = router;
