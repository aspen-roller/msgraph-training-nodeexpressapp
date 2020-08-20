# OIDC with Azure AD

* still uses OIDC
* relies on widely used npm package ([passport](http://www.passportjs.org/)) as authentication middleware for express
    * modify auth callback to redirect back to original endpoint using state meta data
    * wrap passport authentication middleware to
        * check roles
        * check trusted source
* removes svc-oidc
    * no special startup order for services
    * removes a MongoDB database and synchronization
* automate maintenance of Azure AD application and service principal
    * includes redirect URIs
* Infrastructure has better insight/control over application access
    * assign roles to individuals or groups through the Azure portal
* Kong Enterprise Plugin available for [OpenID Connect with Azure AD](https://docs.konghq.com/enterprise/0.35-x/plugins/oidc-azuread/)

## Code Walkthrough

* environment variables: `.env-example`
* constants: `constants.js`
* passport setup: `setupPassport.js`
* express setup: `app.js`
* authentication routes: `routes/auth.js`
* graph api: `graph.js`
* authentication middleware: `middleware/authenticate.js`
* test routes: `routes/users.js`
* docker: `Dockerfile, docker-compose.yml`
* nginx: `nginx/templates/default.conf.template`

## TODO
* use `express-session` appropriately for production
    * set session secret
    * store session data safely (not in-memory)
* store logged in users safely (not in-memory)
* might be able to put passport customization into a dedicated library

## References
* [Build Node.js Express apps with Microsoft Graph](https://docs.microsoft.com/en-us/graph/tutorials/node)
    * this tutorial is the basis for the demo, see my [fork](https://github.com/aspen-roller/msgraph-training-nodeexpressapp) for my modified version of the tutorial
    * [Lucidchart Graphics](https://app.lucidchart.com/invitations/accept/49b1f3fd-ec64-41a8-b9e7-158f3fe4a2e2)
* [Overview of Microsoft Graph](https://docs.microsoft.com/en-us/graph/overview)
* [Authentication flows and application scenarios](https://docs.microsoft.com/en-us/azure/active-directory/develop/authentication-flows-app-scenarios)
