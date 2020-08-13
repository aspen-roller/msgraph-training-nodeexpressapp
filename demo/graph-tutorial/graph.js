// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = {
  getAuthenticatedClient,
  getEvents,
  getUserDetails,
};

function getAuthenticatedClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  return client;
}

async function getEvents(accessToken) {
  const client = getAuthenticatedClient(accessToken);
  const events = await client
    .api('/me/events')
    .select('subject,organizer,start,end')
    .orderby('createdDateTime DESC')
    .get();

  return events;
}

async function getUserDetails(accessToken) {
  const client = getAuthenticatedClient(accessToken);
  const user = await client.api('/me').get();
  return user;
}
