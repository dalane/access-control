const { setAuthCookie } = require('../responses');

/**
* Checks for a "loggedin" session cookie. If it exists then sets an authenticatedUser
* on the request and responds with a header to renew the session cookie
* @param {*} request
* @param {*} response
*/
module.exports.authenticateRequest = (request, response) => {
 const cookies = parseCookiesHeader(request.headers.cookie);
 if (cookies['loggedin'] !== undefined && cookies['loggedin'] === 'true') {
	 setAuthCookie(response);
	 request.authenticatedUser = {
		 id: 'authenticated',
		 name: 'Authenticated User',
		 authenticated: true,
	 };
	 return;
 }
 request.authenticatedUser = {
	 id: 'anonymous',
	 name: 'Anonymous',
	 authenticated: false,
 };
}

function parseCookiesHeader(value) {
	if (value === undefined) {
		return {};
	}
	const cookies =  value.split(';').map(s => s.trim());
	return cookies.reduce((cookies, cookie) => {
		const [ name, value ] = cookie.split('=');
		cookies[name] = value;
		return cookies;
	}, {});
}
