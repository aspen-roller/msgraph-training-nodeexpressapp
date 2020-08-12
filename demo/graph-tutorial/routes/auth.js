// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET auth callback. */
router.get('/signin',
  function (req, res, next) {
    passport.authenticate('azuread-openidconnect',
      {
        response: res,
        prompt: 'login',
        failureRedirect: '/',
        failureFlash: true,
        successRedirect: '/',
      }
    )(req,res,next);
  }
);

const authCallback = [
  (req, res, next) => passport.authenticate('azuread-openidconnect', { response: res })(req, res, next),
  parseState
]

function parseState(req, res, next) {
  if (req.isAuthenticated()) {
    const { state } = req.body;
    const redirect = state ? Buffer.from(state, 'base64').toString() : undefined;
    if (typeof redirect === 'string' && redirect.startsWith('/')) {
      let callbackURL = /(.*)\/auth\/callback$/.exec(process.env.OAUTH_REDIRECT_URI)[1];
      return res.redirect(`${callbackURL}${redirect}`);
    }
  }
  next();
}

router.post('/callback', authCallback);

router.get('/signout',
  function(req, res) {
    req.session.destroy(function(err) {
      req.logout();
      res.redirect('/');
    });
  }
);

module.exports = router;
