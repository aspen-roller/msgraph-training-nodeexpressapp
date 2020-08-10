// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

const RESOURCE_ID = '0800cd2b-ec6f-4544-bfa4-047856e99e2d';

module.exports = {
  getAuthenticatedClient,
  getEvents,
  getUserDetails,
  getUserRoles,
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

async function getUserRoles(accessToken) {
  const client = getAuthenticatedClient(accessToken);
  const appRoleAssignments = await client.api('/me/appRoleAssignments')
    .filter(`resourceId eq ${RESOURCE_ID}`)
    .get();
  console.dir(appRoleAssignments, { depth: null });

  const userRoles = new Set();
  for (let role of appRoleAssignments.value) {
    const appRoleAssignment = appRoleAssignments.value[0];
    switch(appRoleAssignment.appRoleId) {
      case 'b6fe44f2-b1ef-4e19-a06e-240078407dcb':
        userRoles.add('admin');
        break;
      case 'd1c2ade8-98f8-45fd-aa4a-6d06b947c66f':
        userRoles.add('reader');
        break;
      default:
        userRoles.add('user');
        break;
    }
  }

  return Array.from(userRoles);
}
