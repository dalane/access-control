# Policy Execution Point

A Policy Execution Point (PEP) is where the access request is created, calls
the Policy Decision Point with the Access Request and handles the Access Response.

```typescript
/// create the access request
const accessRequest: IAccessRequest = { ... };

// call the pdp with the access request getting back an access response
const accessResponse: IAccessResponse = pdp(accessRequest);

// do something with the access response...
```

It is up to the developer to develop the PEP. Below is an example of a PEP as
an Express.js middleware.

## Example PEP as express.js middleware

```typescript
import { Request, Response, NextFunc, Handler } from 'express'
import { IPolicyDecisionPointFn, IAccessRequest, IAccessResponse, ACCESS_DECISION } from '@dalane/access-control';
import { createServer } from 'http'

/**
 * Create a Policy Execution Point middleware for express.js with the Policy
 * Decision Point injected using function composition.
 */
const policyExecutionPointMiddleware = (policyDecisionPoint: IPolicyDecisionPointFn) => (request: Request, response: Response, next: NextFunc): Handler => {
	const accessRequest: IAccessRequest = {
		subject: {
			// assume that authentication has already occurred and and authenticatedUser
			// has been added to the request
			userid: request.authenticatedUser.id,
		},
		resource: {
			path: request.url,
		},
		action: {
			method: request.method.toUpperCase(),
		},
		environment: {
			ip: request.headers['x-forwarded-for'] ?? request.connection.remoteAddress,
			timestamp: Date.now(),
			userAgent: request.headers['user-agent'],
			dnt: request.headers.dnt,
		},
	};
	const accessResponse: IAccessResponse = policyDecisionPoint(accessRequest);
	// we will deny both deny and not-applicable decisions...
	const isAccessDenied = accessResponse => (accessResponse.decision === ACCESS_DECISION.DENY ||
		accessResponse.decision === ACCESS_DECISION.NOT_APPLICABLE);
	if (true === isAccessDenied(accessResponse)) {
		// handle deny response...
		response.statusCode = 403; // 403 Forbidden
		response.setHeader('Content-Type', 'text/html');
		response.write('<html>')
		response.write('<head><title>Forbidden Error</title></head>');
		response.write('<body><h1>Forbidden Error</h1>');
		response.write('<p>Your request has been denied as it did not satisfy our access policies.</p>');
		response.write('<pre>' + JSON.stringify(accessResponse, null, 2) + '</pre>');
		response.write('</body><html>');
		return response.end()
	}
	request.accessRequest = accessRequest; // we might want to use this elsewhere...
	request.accessResponse = accessResponse; // we might want to use this elsewhere...
	next();
};
```
