const { createRedirectResponse, clearAuthCookie, createOkHtmlResponse } = require("../responses");
const { createLogoutView } = require("../views/logout");

module.exports.logoutController = (request, response) => {
  const ok = createOkHtmlResponse(response);
  const redirect = createRedirectResponse(response);
  if (request.method.toUpperCase() === 'POST') {
    clearAuthCookie(response);
    return redirect('/');
  }
  const view = createLogoutView(request.accessResponse, request.authenticatedUser);
  ok(view);
}
