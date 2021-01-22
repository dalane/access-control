const { createOkHtmlResponse, createRedirectResponse, setAuthCookie } = require("../responses");
const { createLoginView } = require("../views/login");

module.exports.loginController = (request, response) => {
  const ok = createOkHtmlResponse(response);
  const redirect = createRedirectResponse(response);
  if (request.method.toUpperCase() === 'POST') {
    setAuthCookie(response);
    return redirect('/secure');
  }
  const view = createLoginView(request.accessResponse, request.authenticatedUser);
  ok(view);
}
