// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const RESOURCE_ID = '0800cd2b-ec6f-4544-bfa4-047856e99e2d';

module.exports = {
  getAuthenticatedClient,
  getEvents,
  getUserDetails,
  getUserRole,
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

async function getUserRole(accessToken) {
  const client = getAuthenticatedClient(accessToken);
  const appRoleAssignments = await client.api('/me/appRoleAssignments')
    .filter(`resourceId eq ${RESOURCE_ID}`)
    .top(1)
    .get();
  console.dir(appRoleAssignments, { depth: null });

  const appRoleAssignment = appRoleAssignments.value[0];
  switch(appRoleAssignment.appRoleId) {
    case 'b6fe44f2-b1ef-4e19-a06e-240078407dcb': return 'admin';
    case 'd1c2ade8-98f8-45fd-aa4a-6d06b947c66f': return 'reader';
    default: return 'user';
  }
}
