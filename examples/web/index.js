const { loadJsonPolicyFiles, createPolicyDecisionPointFn, createPolicyAdministrationPointFn, POLICY_MATCH_FNS } = require('../../build/app');
const { createServer } = require('http');
const { join } = require('path');
const { createPolicyExecutionPoint } = require('./pep');
const { homeController } = require('./controllers/home');
const { logoutController } = require('./controllers/logout');
const { loginController } = require('./controllers/login');
const { secureController } = require('./controllers/secure');
const { createNotFoundResponse, setAuthCookie } = require('./responses');
const { createNotFoundView } = require('./views/notfound');
const { authenticateRequest } = require('./auth/authentication');
require('source-map-support').install();

const PORT = 8080;

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
    const view = createNotFoundView(request.accessResponse, request.authenticatedUser);
    return notFound(view);
  }
  controller(request, response);
}

const listener = (pep, handleRequest) => (request, response) => {
  authenticateRequest(request, response);
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
    const pep = createPolicyExecutionPoint(pdp);
    const httpServer = createServer(listener(pep, handleRequest(paths)));
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
