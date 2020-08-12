# STAGE 1: base
# base configuration for both dev and prod
# ----------------------------------------------------------
FROM node:12.18.3 as base

LABEL org.opencontainers.image.authors="James Roller <james.roller@aspencapital.com>"
LABEL org.opencontainers.image.title="msgraph-training-nodeexpressapp"

# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod a+x /usr/local/bin/docker-entrypoint.sh
# ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 3000
ENV PORT=3000 \
    NODE_ENV=production \
    PATH=/opt/node_modules/.bin:$PATH

# timezone
# ref: https://serverfault.com/questions/683605/docker-container-time-timezone-will-not-reflect-changes
ARG TZ=America/Los_Angeles
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

# install/remove packages
RUN apt-get update \
    && apt-get -y --purge autoremove \
        imagemagick \
        mercurial \
    && rm -rf /var/lib/apt/lists/*


## STAGE 2: build
# install production dependencies
# ----------------------------------------------------------
FROM base as build

WORKDIR /opt
COPY package*.json ./
ARG NPM_TOKEN
# production dependencies
RUN npm config set strict-ssl false \
    && echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> .npmrc \
    && npm config list \
    && npm ci \
    && npm cache clean --force


## STAGE 3: dev
# setup for development using local code
# ----------------------------------------------------------
FROM build as dev
WORKDIR /opt
ENV NODE_ENV=development
# development dependencies
RUN npm install --only=development \
    && npm cache clean --force
WORKDIR /opt/app
EXPOSE 9229
CMD ["nodemon", "--no-colors", "--inspect=0.0.0.0:9229", "src/index.js"]


## STAGE 4: source
# we only want to copy the source code once
# ----------------------------------------------------------
FROM base as source
WORKDIR /opt/app
COPY . .


# ## STAGE 5: test
# # ----------------------------------------------------------
# FROM source as test

# # copy all dependencies (dev + prod)
# COPY --from=dev /opt/node_modules /opt/node_modules
# WORKDIR /opt/app
# # + audit npm dependencies
# # + lint code
# # RUN dev audit -m low \
# #     && eslint src test tasks
# CMD ["nyc", "mocha"]


## STAGE 6: pre-prod
# ----------------------------------------------------------
FROM source as pre-prod
# remove unnecessary files
RUN rm -rf /opt/app/test \
    && find /opt/app -name ".eslintrc*" -type f -delete
# copy production dependencies
COPY --from=build /opt/node_modules /opt/node_modules


## STAGE 7: prod
# ----------------------------------------------------------
FROM base as prod
COPY --from=pre-prod /opt /opt
# HEALTHCHECK --start-period=30s CMD node docker-healthcheck.js
WORKDIR /opt/app
CMD ["node", "src/index.js"]
