function createOkHtmlResponse(response) {
  return view => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.write(view);
    response.end();
  };
}

function createOkTextResponse(response) {
  return view => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    response.write(view);
    response.end();
  };
}

function createNotFoundResponse(response) {
  return () => {
    response.statusCode = 404;
    response.write('404 Not Found');
    response.end();
  };
}

function createForbiddenResponse(response) {
  return (accessResponse, message) => {
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
  };
}

module.exports = {
  createOkHtmlResponse,
  createOkTextResponse,
  createNotFoundResponse,
  createNotFoundResponse,
  createForbiddenResponse
};
