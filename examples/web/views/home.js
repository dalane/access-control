module.exports.createHomeView = accessResponse => `
<html>
	<head><title>Example ABAC Site</title></head>
	<body><h1>ABAC Web Site Example</h1>
		<p>Try the following links to see the access response...</p>
		<ul>
			<li><a href="/">Home</a></li>
			<li><a href="/login">Login</a></li>
			<li><a href="/logout">Logout</a></li>
			<li><a href="/secure">Secure</a></li>
			<li><a href="/another">Another page without a policy</a></li>
		</ul>
		<p>For this request, we received the following access response from the policy decision point.</p>
		<pre>${JSON.stringify(accessResponse, null, 2)}</pre>
	</body>
<html>
`;
