'use strict';

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
    if (req.isAuthenticated()) {
      const accessToken = await tokens.getAccessToken(req);
      const userRoles = await graph.getUserRoles(accessToken);

      console.log('roles', roles);
      console.log('userRoles', userRoles);
      res.locals.roles = userRoles;

      const intersection = roles.filter(x => userRoles.includes(x));
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
