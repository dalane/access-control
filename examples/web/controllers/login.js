const { createOkHtmlResponse } = require("../responses");
const { createLoginView } = require("../views/login");

module.exports.loginController = (request, response) => {
  const ok = createOkHtmlResponse(response);
  const view = createLoginView(request.accessResponse);
  ok(view);
}
