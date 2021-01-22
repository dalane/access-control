module.exports.createLoginView = (accessResponse) => `
<html>
	<head>
		<title>Login - Example ABAC Site</title>
	</head>
	<body>
		<h1>Login</h1>
  	<p>For this request, we received the following access response from the policy decision point.</p>
  	<pre>${JSON.stringify(accessResponse, null, 2)}</pre>
	</body>
<html>
`;
