const { createOkHtmlResponse } = require("../responses");
const { createSecureView } = require("../views/secure");

module.exports.secureController = (request, response) => {
	const ok = createOkHtmlResponse(response);
	const view = createSecureView(request.accessResponse, request.authenticatedUser);
	ok(view);
}
