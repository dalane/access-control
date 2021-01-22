const { createOkHtmlResponse } = require("../responses");
const { createHomeView } = require("../views/home");

module.exports.homeController = (request, response) => {
  const ok = createOkHtmlResponse(response);
  const view = createHomeView(request.accessResponse);
  ok(view);
}
