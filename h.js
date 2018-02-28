const express = require('express');

const router = express.Router();

async function boi(req, res) {
  console.log(req.body);
  
  return res.send('boi');

}

router.post('/', boi);

module.exports = router;