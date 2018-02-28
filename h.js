const express = require('express');

const router = express.Router();

async function boi(req, res) {
  console.log(req.body.username);
  
  return res.json({boi: "boi"});

}

router.post('/', boi);

module.exports = router;