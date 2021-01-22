const { createForbiddenResponse } = require('./responses');
const { ACCESS_DECISION } = require('../../build/app');

// the policy execution point creates the access request, passes it to the
// policy decision point and then handles the access response from the polcy
// decision point
module.exports.policyExecutionPoint = pdp => (request, response) => {
  let [path, query] = request.url.split('?');
  const accessRequest = makeAccessRequest(request.method, path, request.authenticatedUser, request);
  const accessResponse = pdp(accessRequest);
  const forbidden = createForbiddenResponse(response);
  if (accessResponse.decision === ACCESS_DECISION.NOT_APPLICABLE) {
    forbidden(accessResponse, 'You have not been granted access as your request did not match any of our policies.');
    return false;
  }
  if (accessResponse.decision === ACCESS_DECISION.DENY) {
    forbidden(accessResponse, 'You have not been granted access as your request did not satisfy our policies.');
    return false;
  }
  request.accessResponse = accessResponse;
  return true;
};

function makeAccessRequest(method, path, identity, request) {
  return {
    subject: {
      userid: identity.id,
      name: identity.name,
      groups: identity.groups
    },
    action: {
      method: method
    },
    resource: {
      path: path
    },
    environment: {
      ip: request.headers['x-forwarded-for'] || request.connection.remoteAddress,
      timestamp: Date.now(),
      userAgent: request.headers['user-agent'],
      dnt: request.headers.dnt
    }
  };
}
