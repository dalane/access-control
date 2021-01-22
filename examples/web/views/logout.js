const { linksFragment } = require("./fragments");

module.exports.createLogoutView = (accessResponse, authenticatedUser) => `
<html>
	<head>
		<title>Logout - Example ABAC Site</title>
	</head>
	<body>
		<h1>Logout</h1>
		${linksFragment}
		<p>You are user "${authenticatedUser.name}".</p>
  	<p>For this request, we received the following access response from the policy decision point.</p>
		<pre>${JSON.stringify(accessResponse, null, 2)}</pre>
		<form action="/logout" method="POST">
			<button type="submit">Logout</button>
		</form>
	</body>
<html>
`;
