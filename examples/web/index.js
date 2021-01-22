const { loadJsonPolicyFiles, createPolicyDecisionPointFn, createPolicyAdministrationPointFn, POLICY_MATCH_FNS } = require('../../build/app');
const { createServer } = require('http');
const { join } = require('path');
const { policyExecutionPoint } = require('./pep');
const { homeController } = require('./controllers/home');
const { logoutController } = require('./controllers/logout');
const { loginController } = require('./controllers/login');
const { secureController } = require('./controllers/secure');
const { createNotFoundResponse } = require('./responses');
require('source-map-support').install();

const PORT = 8080;
const authenticateRequest = request => {
  request.authenticatedUser = {
    id: 'anonymous',
    name: 'Anonymous',
    groups: []
  };
}

const CONTROLLERS = {
  '/': homeController,
  '/login': loginController,
  '/logout': logoutController,
  '/secure': secureController
}

const handleRequest = (controllers) => (request, response) => {
  const [path, query] = request.url.split('?');
  const controller = controllers[path];
  request.path = path;
  request.query = query;
  if (controller === undefined) {
    const notFound = createNotFoundResponse(response);
    return notFound();
  }
  controller(request, response);
}

const listener = (authenticateRequest, pep, handleRequest) => (request, response) => {
  authenticateRequest(request);
  if (pep(request, response)) {
    handleRequest(request, response);
  }
};

const logOnListening = port => console.info(`http://localhost:${port} is listening...`);
const logOnClose = port => console.info(`http://localhost:${port} has stopped listening...`);

const main = async (paths, port) => {
  try {
    // create the full path to the policies folder...
    const policiesFolder = join(__dirname, 'policies');
    const policies = await loadJsonPolicyFiles(policiesFolder);
    const pap = createPolicyAdministrationPointFn(policies, {
      actions: POLICY_MATCH_FNS.actions,
      principals: POLICY_MATCH_FNS.principals,
      resources: POLICY_MATCH_FNS.resources,
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
      console.log('SIGINT message received. Closing HTTP server and exiting.');
      httpServer.close(() => process.exit(0));
    });
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
};

// run the app
main(CONTROLLERS, PORT);
