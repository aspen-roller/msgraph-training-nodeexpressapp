'use strict';

const constants = require('./constants');
var graph = require('./graph');
const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

const oauth2 = require('simple-oauth2').create({
    client: {
        id: process.env.OAUTH_APP_ID,
        secret: process.env.OAUTH_APP_PASSWORD
    },
    auth: {
        tokenHost: constants.OAUTH_AUTHORITY,
        authorizePath: constants.OAUTH_AUTHORIZE_ENDPOINT,
        tokenPath: constants.OAUTH_TOKEN_ENDPOINT
    }
});


module.exports = setupPassport;

function setupPassport(app) {

    // Passport calls serializeUser and deserializeUser to manage users
    passport.serializeUser(function (user, done) {
        // Use the OID property of the user as a key
        app.locals.users[user.profile.oid] = user;
        done(null, user.profile.oid);
    });

    passport.deserializeUser(function (id, done) {
        done(null, app.locals.users[id]);
    });

    // Configure OIDC strategy
    passport.use(new OIDCStrategy(
        {
            identityMetadata: `${constants.OAUTH_AUTHORITY}${constants.OAUTH_ID_METADATA}`,
            clientID: process.env.OAUTH_APP_ID,
            responseType: 'code id_token',
            responseMode: 'form_post',
            redirectUrl: process.env.OAUTH_REDIRECT_URI,
            allowHttpForRedirectUrl: true,
            clientSecret: process.env.OAUTH_APP_PASSWORD,
            validateIssuer: false,
            scope: process.env.OAUTH_SCOPES.split(' ')
        },
        signInComplete
    ));

    // Callback function called once the sign-in is complete
    // and an access token has been obtained
    async function signInComplete(iss, sub, profile, jwtClaims, accessToken, refreshToken, params, done) {
        if (!profile.oid) {
            return done(new Error("No OID found in user profile."));
        }

        try {
            const user = await graph.getUserDetails(accessToken);

            if (user) {
                // Add properties to profile
                profile['email'] = user.mail ? user.mail : user.userPrincipalName;
            }
        } catch (err) {
            return done(err);
        }

        // Create a simple-oauth2 token from raw tokens
        let oauthToken = oauth2.accessToken.create(params);

        // Save the profile and tokens in user storage
        app.locals.users[profile.oid] = { jwtClaims, profile, oauthToken };
        return done(null, app.locals.users[profile.oid]);
    }

    return passport;
}
