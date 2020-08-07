const passport = require('passport');

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

function authenticate(opts={}) {
  const defaultOpts = {
    passThru: true,
    provider: 'azuread-openidconnect',
  };
  opts = Object.assign({}, defaultOpts, opts);

  return (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      passport.authenticate(opts.provider, {
        response: res,
        customState: Buffer.from(req.originalUrl).toString('base64'),
      })(req, res, next);
    }
  }
}

// References for dynamic redirects after authentication
// https://stackoverflow.com/questions/47793615/utilizing-state-customstate-with-passport-azure-ad
// https://dev.to/dangolant/dynamic-auth-redirects-with-passportjs-380g

router.get('/me', authenticate(), (req, res) => {
  res.send('me!!!');
});

module.exports = router;
