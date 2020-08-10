var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

const auth = require('../middleware/authenticate');
router.get('/me', auth('admin'), (req, res) => {
  res.send({ roles: res.locals.roles });
});

module.exports = router;
