const { linksFragment } = require("./fragments");

module.exports.createForbiddenView = (accessResponse, authenticatedUser, message) => `
<html>
	<head><title>Forbidden Error</title></head>
	<body><h1>Forbidden Error</h1>
		<p>You are "${authenticatedUser.name}"</p>
		<p>${message}</p>
		${linksFragment}
		<p>Below is the response we received from the policy decision point.</p>
		<pre>${JSON.stringify(accessResponse, null, 2)}</pre>
	</body>
<html>
`;
