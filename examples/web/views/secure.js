const { linksFragment } = require("./fragments");

module.exports.createSecureView = (accessResponse, authenticatedUser) => `
<html>
	<head><title>Secure Page - Example ABAC Site</title></head>
	<body><h1>Secure Page</h1>
		${linksFragment}
		<p>You are user "${authenticatedUser.name}".</p>
		<p>For this request, we received the following access response from the policy decision point.</p>
		<pre>${JSON.stringify(accessResponse, null, 2)}</pre>
	</body>
<html>
`;
