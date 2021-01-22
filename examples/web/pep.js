const { createForbiddenResponse } = require('./responses');
const { ACCESS_DECISION } = require('../../build/app');
const { createForbiddenView } = require('./views/forbidden');

// the policy execution point creates the access request, passes it to the
// policy decision point and then handles the access response from the polcy
// decision point
module.exports.createPolicyExecutionPoint = pdp => (request, response) => {
  let [path, query] = request.url.split('?');
  const accessRequest = makeAccessRequest(request.method, path, request.authenticatedUser, request);
  const accessResponse = pdp(accessRequest);
  const forbidden = createForbiddenResponse(response);
  if (accessResponse.decision === ACCESS_DECISION.NOT_APPLICABLE) {
    const view = createForbiddenView(accessResponse, request.authenticatedUser, `You have not been granted access as your request did not match any of our policies.`);
    forbidden(view);
    return false;
  }
  if (accessResponse.decision === ACCESS_DECISION.DENY) {
    const view = createForbiddenView(accessResponse, request.authenticatedUser, `You have not been granted access as your request did not satisfy our policies.`);
    forbidden(view);
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
      authenticated: identity.authenticated,
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
