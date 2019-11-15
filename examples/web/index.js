const { policyDecisionPoint, policy, accessResponse } = require('../../build/app');
const { makePolicyDecisionPoint, makeFindPolicySet } = policyDecisionPoint;
const { createDefaultCompiledPolicies } = policy;
const { ACCESS_DECISION } = accessResponse;
const { createServer } = require('http');
const { join } = require('path');
require('source-map-support').install();

const PORT = 8080;
const authenticateRequest = request => {
  request.authenticatedUser = {
    id: 'anonymous',
    name: 'Anonymous',
    groups: []
  };
}

const handleHomePath = (request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');
  response.write('<html>')
  response.write('<head><title>Example ABAC Site</title></head>');
  response.write('<body><h1>ABAC Web Site Example</h1>');
  response.write('<p>Try the following links to see the access response...</p>');
  response.write('<ul>');
  response.write('<li><a href="/">Home</a></li>');
  response.write('<li><a href="/login">Login</a></li>');
  response.write('<li><a href="/logout">Logout</a></li>');
  response.write('<li><a href="/secure">Secure</a></li>');
  response.write('<li><a href="/another">Another page without a policy</a></li>');
  response.write('</ul>');
  response.write('<p>For this request, we received the following access response from the policy decision point.</p>');
  response.write('<pre>' + JSON.stringify(request.accessResponse, null, 2) + '</pre>');
  response.write('</body><html>');
  response.end();
}

const handleLoginPath = (request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');
  response.write('<html>')
  response.write('<head><title>Login - Example ABAC Site</title></head>');
  response.write('<body><h1>Login</h1>');
  response.write('<p>For this request, we received the following access response from the policy decision point.</p>');
  response.write('<pre>' + JSON.stringify(request.accessResponse, null, 2) + '</pre>');
  response.write('</body><html>');  response.end();
}

const handleLogoutPath = (request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.write('handling the logout path...');
  response.end();
}

const handleSecurePath = (request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.write('handling the secure path...');
  response.end();
}

const PATH_HANDLERS = {
  '/': handleHomePath,
  '/login': handleLoginPath,
  '/logout': handleLogoutPath,
  '/secure': handleSecurePath
}

const handleRequest = (paths) => (request, response) => {
  const [path, query] = request.url.split('?');
  let handler = paths[path];
  request.path = path;
  request.query = query;
  if (handler === undefined) {
    response.statusCode = 404;
    response.write('404 Not Found');
    return response.end();
  }
  handler(request, response);
}

const makeAccessRequest = (method, path, identity, request) => ({
  subject: {
    'user-id': identity.id,
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
});

// the policy execution point creates the access request, passes it to the
// policy decision point and then handles the access response from the polcy
// decision point
const policyExecutionPoint = pdp => (request, response) => {
  let [path, query] = request.url.split('?');
  const accessRequest = makeAccessRequest(request.method, path, request.authenticatedUser, request);
  const accessResponse = pdp(accessRequest);
  const send403Response = (response, accessResponse, message) => {
    response.statusCode = 403; // 403 Forbidden
    response.setHeader('Content-Type', 'text/html');
    response.write('<html>')
    response.write('<head><title>Forbidden Error</title></head>');
    response.write('<body><h1>Forbidden Error</h1>');
    response.write('<p>' + message + '</p>');
    response.write('<p>Below is the response we received from the policy decision point.</p>');
    response.write('<pre>' + JSON.stringify(accessResponse, null, 2) + '</pre>');
    response.write('</body><html>');
    response.end();
  }
  if (accessResponse.decision === ACCESS_DECISION.NOT_APPLICABLE) {
    send403Response(response, accessResponse, 'You have not been granted access as your request did not match any of our policies.');
    return false;
  }
  if (accessResponse.decision === ACCESS_DECISION.DENY) {
    send403Response(response, accessResponse, 'You have not been granted access as your request did not satisfy our policies.');
    return false;
  }
  request.accessResponse = accessResponse;
  return true;
}

const listener = (authenticateRequest, pep, handleRequest) => (request, response) => {
  authenticateRequest(request);
  if (pep(request, response)) {
    handleRequest(request, response);
  }
};

const logOnListening = port => console.info('http://127.0.0.1:' + port + ' is listening...');
const logOnClose = port => console.info(`http://127.0.0.1:${port} has stopped listening...`);

const main = async (paths, port) => {
  try {
    // create the full path to the policies folder...
    const policiesFolder = join(__dirname, 'policies');
    // create the compiled policies using the default options of http methods,
    // url pattern for resource, and subject user-id for the principal...
    const compiledPolicies = await createDefaultCompiledPolicies(policiesFolder);
    // create the findPolicySet function which will take an access request and
    // return any policies that match an action, principal and resource...
    const findPolicySet = makeFindPolicySet(compiledPolicies);
    // create the policy decision point which will obtain a policy set and then
    // give an access response with an allow, deny or not-applicable decision
    // for a given access request..
    const pdp = makePolicyDecisionPoint(findPolicySet);
    // the policy execution point creates the access request, passes it to the
    // policy decision point, get the access response and then return an error
    // to the client or allow the request to continue...
    const pep = policyExecutionPoint(pdp);
    const httpServer = createServer(listener(authenticateRequest, pep, handleRequest(paths)));
    httpServer.on('listening', () => logOnListening(port));
    httpServer.on('close', () => logOnClose(port));
    httpServer.listen(port);
    process.on('SIGINT', () => {
      httpServer.close(() => process.exit(0));
    });
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
};

// run the app
main(PATH_HANDLERS, PORT);
