# Access Requests

An access request contains all the information about the request including what
resource is being requested (resource), who is making the request (subject), the
context of the request (environment), and the requested action to be applied to
the resource (action).

The access request is created as a "Plain Old Javascript Object" however there
is a Typescript interface for convenience IAccessRequest in the accessRequest
namespace.

```typescript
interface IAccessRequest {
	subject:{
		[index:string]:any
	}
	action: {
		[index:string]:any
	}
	resource: {
		[index:string]:any
	}
	environment: {
		[index:string]:any
	}
}
```

You determine what information is included in each property.

The access request must contain all the information required to make a decision.
The "Policy Decision Point" will match the request against the registered policies
and then return an "Access Response".

Sources of data for the access request are known as "Policy Information
Points" (PIP). How this is retrieved is left to the developer. In a proprietary
ABAC system, the policy decision point would identify missing attributes and
query each PIP for values itself but for the moment, this is not implemented.

## Subject

The ```subject``` contains the details of the client making the request. Typically
this would be an authenticated user (an authenticated user could still be anonymous).

```typescript
const accessRequest: IAccessRequest = {
	subject: {
		userid: 'authenticated-user-id',
		scopes: [
			'profile',
			'dashboard',
			'accounts'
		],
		groups: [
			'accounting'
		]
	}
};
```

The subject is matched against the principal of the policy as long as there is
a filter function provided. This can be achieved using the functions defined in
the creation of the PDP.

## Action

A subject wants to perform an __action__ on a resource.

```typescript
const accessRequest:IAccessRequest = {
	action: {
		method: 'DELETE'
	}
};
```

This could be a http method, e.g. ```DELETE```, or any other action that you
determine. As long as there is a way to match the action to the policy. This can
be achieved using the predefined actions that are provided in the library or
writing your own.

## Resource

This is information about the resource being accessed. This might contain the
path of the resource being accessed, permissions that the resource has (for example
who the owner is, which groups / users have access), the mime type of the resource
being accessed if you offer multiple types, etc.

```typescript
const accessRequest:IAccessRequest = {
	resource: {
		path: '/path/to/resource',
		owner: 'owner-id',
		editors: [ 'editor1-id', 'editor2-id' ],
		mimetype: 'text/html'
	}
};
```

You can use the built-in functions for matching the access request to a policy
or define your own.

## Environment

Properties of the environment such as IP address, user agent paramaters,
protocol (tcp/http), encryption method, client type, etc...

```typescript
const accessRequest:IAccessRequest = {
	environment: {
		protocol: 'http',
		ip: '198.0.0.1',
		device: 'mobile',
		userAgent: ''
	}
};
```

For environment attributes, you would match your access request to the policies
in the specification.
