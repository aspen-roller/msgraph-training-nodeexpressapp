const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

const auth = require('../middleware/authenticate');

router.get('/me', auth('Admin'), (req, res) => {
  res.send({ roles: req.user.jwtClaims.roles });
});

router.get('/reader', auth('Reader'), (req, res) => {
  res.send({ roles: req.user.jwtClaims.roles });
});

router.get('/test', auth(['Reader']), (req, res) => {
  res.send({msg: 'test is working!'});
});

router.get('/app1', auth('Admin'), (req, res, next) => {
  fetch('http://nginx/app1/users/test')
    .then(res => res.json())
    .then(body => res.send(body))
    .catch(next);
});

router.get('/app2', auth('Admin'), (req, res, next) => {
  fetch('http://nginx/app2/users/test')
    .then(res => res.json())
    .then(body => res.send(body))
    .catch(next);
});

module.exports = router;
