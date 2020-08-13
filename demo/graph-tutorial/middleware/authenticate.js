'use strict';

const { inRange } = require('../ip');
const graph = require('../graph');
const passport = require('passport');
const tokens = require('../tokens');

module.exports = authenticate;

// References for dynamic redirects after authentication
// https://stackoverflow.com/questions/47793615/utilizing-state-customstate-with-passport-azure-ad
// https://dev.to/dangolant/dynamic-auth-redirects-with-passportjs-380g

function authenticate(roles=[]) {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return async (req, res, next) => {
    console.log('authenticate - middleware');
    console.dir(req.headers, { depth: null });

    // detect if request came from local network
    const clientIP = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0];
    const isLocalIP = inRange(clientIP);

    // if (isLocalIP) {
    //   next();
    // } else
    if (req.isAuthenticated()) {
      console.log('allowed roles', roles);
      console.log('user roles', req.user.jwtClaims.roles);

      const intersection = roles.filter(x => req.user.jwtClaims.roles.includes(x));
      if (intersection.length > 0) {
        next();
      } else {
        next(new Error(`not authorized - found roles: ${userRoles}, allowed roles: ${roles}`));
      }
  } else {
      passport.authenticate('azuread-openidconnect', {
        response: res,
        // the /auth/callback route decodes the state
        customState: Buffer.from(req.originalUrl).toString('base64'),
      })(req, res, next);
    }
  }
}
