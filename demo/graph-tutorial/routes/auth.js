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
        customState: Buffer.from(req.originalUrl).toString('base64'),
      }
    )(req,res,next);
  }
);

function authCallback(opts={}) {
  const defaultOpts = {
    failureFlash: true,
    failureRedirect: '/',
    provider: 'azuread-openidconnect',
    successRedirect: '/',
  };
  opts = Object.assign({}, defaultOpts, opts);

  return (req, res, next) => {
    passport.authenticate(opts.provider,
      {
        response: res,
        failureRedirect: opts.failureRedirect,
        failureFlash: opts.failureFlash,
        // successRedirect: opts.successRedirect,
        customState: Buffer.from(req.originalUrl).toString('base64'),
      }
    )(req, res, next);
  }
}

function extractState(req, res, next) {
  if (req.isAuthenticated()) {
    const { state } = req.body;
    const redirect = state ? new Buffer(state, 'base64').toString() : undefined;
    if (typeof redirect === 'string' && redirect.startsWith('/')) {
      return res.redirect(redirect);
    }
  }
  next();
}

// <CallbackRouteSnippet>
router.post('/callback', authCallback(), extractState);
// </CallbackRouteSnippet>

router.get('/signout',
  function(req, res) {
    req.session.destroy(function(err) {
      req.logout();
      res.redirect('/');
    });
  }
);

module.exports = router;
