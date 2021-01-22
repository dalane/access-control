const { loadJsonPolicyFiles, createPolicyDecisionPointFn, createPolicyAdministrationPointFn, ACCESS_DECISION, POLICY_MATCH_FNS } = require('../../build/app');
const { createServer } = require('http');
const { join } = require('path');
const { policyExecutionPoint } = require('./pep');
const { homeController } = require('./controllers/home');
const { createLoginView } = require('./views/login');
require('source-map-support').install();

const PORT = 8080;
const authenticateRequest = request => {
  request.authenticatedUser = {
    id: 'anonymous',
    name: 'Anonymous',
    groups: []
  };
}

const handleLoginPath = (request, response) => {
  const loginView = createLoginView(request.accessResponse);
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/html');
  response.write(loginView);
  response.end();
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

const CONTROLLERS = {
  '/': homeController,
  '/login': handleLoginPath,
  '/logout': handleLogoutPath,
  '/secure': handleSecurePath
}

const handleRequest = (controllers) => (request, response) => {
  const [path, query] = request.url.split('?');
  const handler = controllers[path];
  request.path = path;
  request.query = query;
  if (handler === undefined) {
    response.statusCode = 404;
    response.write('404 Not Found');
    return response.end();
  }
  handler(request, response);
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
    const policies = await loadJsonPolicyFiles(policiesFolder);
    const pap = createPolicyAdministrationPointFn(policies, {
      actions: [ ...POLICY_MATCH_FNS.actions ],
      principals: [ ...POLICY_MATCH_FNS.principals ],
      resources: [ ...POLICY_MATCH_FNS.resources ],
    });
    // create the policy decision point which will obtain a policy set and then
    // give an access response with an allow, deny or not-applicable decision
    // for a given access request..
    const pdp = createPolicyDecisionPointFn(pap);
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
main(CONTROLLERS, PORT);
