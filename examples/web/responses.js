function createOkHtmlResponse(response) {
  return view => {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.write(view);
    response.end();
  };
}

function createNotFoundResponse(response) {
  return view => {
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/html');
    response.write(view);
    response.end();
  };
}

function createForbiddenResponse(response) {
  return (view) => {
    response.statusCode = 403; // 403 Forbidden
    response.setHeader('Content-Type', 'text/html');
    response.write(view);
    response.end();
  };
}

function createRedirectResponse(response) {
  return path => {
    response.statusCode = 303;
    response.setHeader('Location', path);
    response.end();
  }
}

function setAuthCookie(response) {
  response.setHeader('Set-Cookie', 'loggedin=true; HttpOnly; SameSite=strict; Max-Age=3600');
}

function clearAuthCookie(response) {
  response.setHeader('Set-Cookie', 'loggedin=true; HttpOnly; SameSite=strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT');
}

module.exports = {
  createOkHtmlResponse,
  createNotFoundResponse,
  createNotFoundResponse,
  createForbiddenResponse,
  createRedirectResponse,
  setAuthCookie,
  clearAuthCookie,
};
