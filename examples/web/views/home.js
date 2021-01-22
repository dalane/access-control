const { linksFragment } = require("./fragments");

module.exports.createHomeView = (accessResponse, authenticatedUser) => `
<html>
	<head><title>Example ABAC Site</title></head>
	<body><h1>ABAC Web Site Example</h1>
		${linksFragment}
		<p>You are user "${authenticatedUser.name}".</p>
		<p>For this request, we received the following access response from the policy decision point.</p>
		<pre>${JSON.stringify(accessResponse, null, 2)}</pre>
	</body>
<html>
`;
