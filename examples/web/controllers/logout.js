const { createOkTextResponse } = require("../responses");
const { createLogoutView } = require("../views/logout");

module.exports.logoutController = (request, response) => {
  const ok = createOkTextResponse(response);
  const view = createLogoutView();
  ok(view);
}
