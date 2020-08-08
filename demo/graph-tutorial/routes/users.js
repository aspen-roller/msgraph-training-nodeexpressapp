const passport = require('passport');

var express = require('express');
var router = express.Router();

const graph = require('../graph');
const tokens = require('../tokens');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

function authenticate(opts={}) {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      passport.authenticate('azuread-openidconnect', {
        response: res,
        customState: Buffer.from(req.originalUrl).toString('base64'),
      })(req, res, next);
    }
  }
}

// References for dynamic redirects after authentication
// https://stackoverflow.com/questions/47793615/utilizing-state-customstate-with-passport-azure-ad
// https://dev.to/dangolant/dynamic-auth-redirects-with-passportjs-380g

router.get('/me', authenticate(), async (req, res, next) => {
  try {
    const accessToken = await tokens.getAccessToken(req);
    const role = await graph.getUserRole(accessToken);
    res.send({ role });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
