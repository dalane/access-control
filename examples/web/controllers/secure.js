const { createOkTextResponse } = require("../responses");
const { createHomeView } = require("../views/home");
const { createSecureView } = require("../views/secure");

module.exports.secureController = (request, response) => {
	const ok = createOkTextResponse(response);
	const view = createSecureView();
	ok(view);
}
