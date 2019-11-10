const { createDefaultPolicyDecisionPoint } = require('../../build/app');
const { createServer } = require('http');
const { join } = require('path');
require('source-map-support').install();

const PORT = 8080;
const authenticateRequest = cookie => {
  return {
    id: 'anonymous',
    name: 'Anonymous',
    groups: []
  };
}

const handleHomePath = (request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.write('handling the home path...');
  response.end();
}

const handleLoginPath = (request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.write('handling the login path...');
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

const paths = {
  '/': handleHomePath,
  '/login': handleLoginPath,
  '/logout': handleLogoutPath,
  '/secure': handleSecurePath
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
    ip: request.ip,
    timestamp: Date.now(),
    userAgent: request.headers['user-agent'],
    dnt: request.headers.dnt
  }
});

const listener = (pdp) => (request, response) => {
  const identity = authenticateRequest(request.headers.cookie);
  let [path, query] = request.url.split('?');
  const accessRequest = makeAccessRequest(request.method, path, identity, request);
  console.log(accessRequest);
  const accessResponse = pdp(accessRequest);
  console.log(accessResponse);
  let handler = paths[path];
  request.path = path;
  request.query = query;
  if (handler === undefined) {
    response.statusCode = 404;
    response.write('404 Not Found');
    return response.end();
  }
  handler(request, response);
};

const logOnListening = port => console.info('http://127.0.0.1:' + port + ' is listening...');
const logOnClose = port => console.info(`http://127.0.0.1:${port} has stopped listening...`);

const policiesFolder = join(__dirname, 'policies');

const app = async (port) => {
  try {
    const pdp = await createDefaultPolicyDecisionPoint(policiesFolder);
    const httpServer = createServer(listener(pdp));

    httpServer.on('listening', () => logOnListening(port));

    httpServer.on('close', () => logOnClose(port));

    httpServer.listen(port);

    process.on('SIGINT', () => {
      console.info('Interrupt signal received, shutting down example web server...');
      httpServer.close(() => process.exit(0));
    });

  } catch (error) {
    console.error(error);
    process.exit(0);
  }
};

app(PORT);
