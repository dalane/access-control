const { linksFragment } = require("./fragments");

module.exports.createLoginView = (accessResponse, authenticatedUser) => `
<html>
	<head>
		<title>Login - Example ABAC Site</title>
	</head>
	<body>
		<h1>Login</h1>
		${linksFragment}
		<p>You are user "${authenticatedUser.name}".</p>
  	<p>For this request, we received the following access response from the policy decision point.</p>
		<pre>${JSON.stringify(accessResponse, null, 2)}</pre>
		<form action="/login" method="POST">
			<button type="submit">Login</button>
		</form>
	</body>
<html>
`;
