const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

const auth = require('../middleware/authenticate');
const { route } = require('./auth');
router.get('/me', auth('admin'), (req, res) => {
  res.send({ roles: res.locals.roles });
});

router.get('/app1', (req, res, next) => {
  fetch('http://nginx/app1/users/me')
    .then(result => {
      res.send(result.text());
    })
    .catch(next);
});

router.get('/app2', (req, res, next) => {
  fetch('http://nginx/app2/users/me')
    .then(result => {
      res.send(result.text());
    })
    .catch(next);
});

module.exports = router;
