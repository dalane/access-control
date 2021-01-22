const { linksFragment } = require("./fragments");

module.exports.createNotFoundView = (accessResponse, authenticatedUser) => `
<html>
	<head><title>Not Found Error</title></head>
	<body>
		<h1>Not Found Error</h1>
		${linksFragment}
		<p>You are "${authenticatedUser.name}"</p>
		<p>The requested page was not found.</p>
		<p>For this request, we received the following access response from the policy decision point.</p>
		<pre>${JSON.stringify(accessResponse, null, 2)}</pre>
		<p>An authenticated user will see this page because we have a policy "all-pages.policy.json"
		which allows access to authenticated users to any resource "*".<p>
	</body>
<html>
`;
