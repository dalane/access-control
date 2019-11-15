# Attribute Based Access Control libary for your Node.js apps

The node package ```@dalane/access-control``` is an attribute based access
control (ABAC) system for node applications.

At it's most basic, access control using an attribute based access control system
is about allowing or denying an access request based on policies that match
the access request. The access request contains the attribute values and the
policy contains the rules for verifying those attributes.

To have an attribute based access control system you need the following components
to work together:

1. Policies that contain the rules for accessing resources and by whom.
2. An Access Request that contains the attributes of the request. You create this
   with all of the attributes required for the policies to be validated.
3. A way of filtering the policies down to a succinct Policy Set containing only
   the policies that match the user making the access request and the resource
   being accessed.
4. Validating the access request against the specification of each policy in the policy
   set getting an Access Response containing with the "allow" / "deny" decision.
5. Implementing the decision in the access response. For example this could be
   to display an authentication dialog, return an HTTP error, etc.

The library is built as a collection of functions that the developer can mix and
match as required to build an access control system. We've provided a number of
convenience functions for matching policies that work with certain rules including
using a URL path format for the resource identifier.

For more information on ABAC see the ["Guide to Attribute Based Access Control (ABAC) Definition and Considerations"](https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-162.pdf)

## Installation

```
yarn add @dalane/access-control
```

or

```
npm install --save @dalane/access-control
```

## Getting Started

The library was developed using TypeScript and is built around a collection of
functions that help you get started with attribute based access control. You can
use these functions or develop your own.

### Loading and Compiling Policies

The first step is to develop your policies and then "compile" them. Policies can
be loaded from JSON files (with the extension ```.policy.json```) or as plain
javascript objects. To load from files, we have provided a function
```loadJsonPolicyFiles```.

```typescript
// import the files namespace from the library...
import { files } from '@dalane/access-control';

// the function to load JSON policy files is in this namespace...
const loadJsonPolicyFiles = files.loadJsonPolicyFiles;

const pathToPolicies = process.env.POLICY_FILES_PATH; // or where ever you have specified your path

// loading the policies is an asynchronous function returning a promise so
// you will need to handle the promise...
const policies:IPolicy[] = await loadJsonPolicyFiles(pathToPolicies);
```

This function returns an array of plain javascript objects with any merging
of policy files that were required completed.

The next step is to compile the policy using the ```makeCompilePolicy``` function.
A compiled policy is basically the loaded policy object decorated with functions
to match policies to access requests.

```makeCompilePolicy``` requires several additional compiler functions to be provided.
You can use the built-in functions or provide your own.

```typescript
// import the namespaces for compiling policies from @dalane/access-control
import { action, policy, principal, resource, specification } from '@dalane/access-control';

// extract the functions we want to use from the specification namespace...
const {
  makeCompileCompositeAssertions,
  makeCompileAssertions,
  makeCompileSpecification,
  COMPOSITES,
  ASSERTIONS
} = specification;

// extract the functions we want to use from the policy namespace...
const { makeCompilePolicy } = policy;

// we will compile composite assertions using the default composite functions.
// This being anyOf and allOf...
const compileCompositeAssertionFn = makeCompileCompositeAssertions(COMPOSITES);

// we will compile the assertions using the defaul assertion functions...
const compileAssertionFn = makeCompileAssertions(ASSERTIONS);

// we will compile a policy specification using the composite and assertion compilers...
const compileSpecificationFn = makeCompileSpecification(compileCompositeAssertionFn)(compileAssertionFn);

// extract from the action namespace, the compiler function that will
// match the policy action to an access request based on HTTP verbs...
const { compileHttpAction } = action;

// extract from the resource namespace, the compiler function that will match
// the policy resource to an access request using a URL pattern...
const { compileUrlPatternResource } = resource;

// extract from the principal namespace, the compiler function that will match
// the policy principal to an access request using a user id...
const { compileUserIdPrincipal } = principal;

// we will create our policy compiler using the declared compilers...
// makeCompilePolicy(actionCompiler)(resourceCompiler)(principalCompiler)(specificationCompiler)
const compilePolicyFn = makeCompilePolicy(compileHttpAction)(compileUrlPatternResource)(compileUserIdPrincipal)(compileSpecificationFn);

// finally, we map through the policies we loaded and apply the created policy
// compiler...
const compiledPolicies = loadedFilePolicies.map(compilePolicyFn);
```

### Granting or denying access using the Policy Decision Point

Once you have your compiled policies, they can be used by the policy decision
point to validate access requests against each policy.

#### Policy Sets

Validation is a two step process. First, the list of policies is reduced down
to a policy set based on whether or not the access request matches the resource,
principal and action. This is done using ```makeFindPolicySet``` which when
passed the compiled policies and an access request returns an array of ```IMatchedPolicy```
objects that satisfy the resource, principal and action.

A policy set is a collection of policies that apply to the subject, action and
resource of each request. The policy decison point requires a function that returns
an array of objects with the interface ```IMatchedPolicy```.

```typescript
interface IMatchedPolicy {
  policy:ICompiledPolicy // the matched policy
  params:any // any params that may have been matched using regular expressions or other pattern matching
}
```

For you convenience, we've provided a function ```makeFindPolicySet``` that reduces
an array of in-memory compiled policies to a policy set that matches the access request.

```typescript
import { policyDecisionPoint } from "@dalane/access-control";
const { makeFindPolicySet, makePolicyDecisionPoint } = policyDecisionPoint;
const compiledPolicies = [...]; // an array containing the compiled policies...
const findPolicySetFn = makeFindPolicySet(compiledPolicies);
const pdp = makePolicyDecisionPoint(findPolicySetFn);
```

If the following properties:

- principal
- resource
- action

are missing from the policy (for example, in base policies that you are using
to extend other policies) then that policy will not be included in any policy set as
these will return false on any request to match to an access request.


```typescript
import { policyDecisionPoint, accessResponse } from '@dalane/access-control';

// extract from the policy decsion point namespace the functions we need to
// create a policy decision point...
const { makeFindPolicySet, makePolicyDecisionPoint } = policyDecisionPoint;

// access decision is an enum of decisions that the policy decision point will
// return...
const { ACCESS_DECISION } = accessResponse;

// using the built-in function for policy sets will use the in memory compiled
// policies. You can create your own function to retrieve policies from your
// own policy store.
const findPolicySet = makeFindPolicySet(compiledPolicies);
```

#### Policy Decision Point

The policy decision point validates the access request against the policies
contained in the policy set. This will result in an ALLOW decision if the policy
effect is ALLOW or a DENY decision if the policy effect is DENY. If the policy
set is empty, the policy decision point will return a NOT-APPLICABLE decision.
It is up the calling function to determine how they handle these responses.

```typescript
import { policyDecisionPoint } from '@dalane/access-control';

// extract from the policy decsion point namespace the functions we need to
// create a policy decision point...
const { makePolicyDecisionPoint } = policyDecisionPoint;

// the policy decision point used the function to find a policy set. It has no
// knowledge of the compiled policies...
const policyDecisionPoint = makePolicyDecisionPoint(findPolicySet);
```

Now that you have a policy decision point you can validate access requests
against your policies to determine if the access request should be granted or
denied.

This is typically dones using a "policy execution point" (PEP). It is up to you to
develop your PEP however it could look something like this using Express middleware.

```typescript
import * as express from 'express'
import { authenticationMiddleware } from 'my-auth-middleware-lib';
import { createServer } from 'http'

// implement our policy execution point as express middleware...
const policyExecutionPointMiddleware = (policyDecisionPoint) => (request:Request, response:Response, next:NextFunc) => {
  const accessRequest = {
    subject: {
      'user-id': request.authenticatedUser.id
    },
    resource: {
      path: request.url
    },
    action: {
      method: 'GET'
    },
    environment: {
      ip: request.headers['x-forwarded-for'] || request.connection.remoteAddress,
      timestamp: Date.now(),
      userAgent: request.headers['user-agent'],
      dnt: request.headers.dnt
    }
  };
  const accessResponse = policyDecisionPoint(accessRequest);
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

const app = express();
app.use(authenticationMiddleware);
app.use(policyExecutionPointMiddleware(policyDecisionPoint));
```


## Policies

Policies are the foundation of the attribute based access control system.

By default you can create your policies as JSON files or you write them as plain
javascript objects. These are then compiled (basically adding some functions to
the policy that return true/false based on the access request).

```JSON
{
  "version": 1,
  "extends": "<relative path to policy file>",
  "id": "<unique-id-for-your-policy>",
  "name": "<a human friendly name for your policy>",
  "description": "<a human friendly description of your policy>",
  "effect": "< Deny | Allow >",
  "action": "<action-reference>",
  "resource": "<resource-reference>",
  "principal": "<principal-reference>",
  "specification": {
    "anyOf": [
      {
        "isTrue": {
          "attribute": "subject.isAdmin"
        }
      },
      {
        "isEqual": {
          "attribute": "subject.isAdmin",
          "expected": "${resource.isAdmin}"
        }
      },
      {
        "allOf": [
          {
            "isEqual": {
              "attribute": "subject.email",
              "expected": "example@example.com"
            }
          },
          {
            "isGreaterThanOrEqual": {
              "attribute": "subject.age",
              "expected": 18
            }
          }
        ]
      }
    ]
  }
}
```

Or they can be created using Plain Javascript Objects using the same structure.

### Version

Currently, there is only one version supported. Therefore the version should be
set to 1.

```json
{
  "version": 1
}
```

### ID

Providing a unique ID for your policy helps with identifying which policies
were used by the decision point and tracing errors. This is provided by you and
is not a system generated identifier.

```json
{
  "id": "<unique-policy-id>"
}
```

### Principal

The principal element of the policy allows you to target a policy to a user or a
service.

A principal is a user, role, group, service, etc that the policy applies to. The
identify of the principal is specified in the policy using the ```principal``` property.

```json
{
  "principal": "<identifier>"
}
```

The value for ```principal``` is compiled into a function that returns a
true/false result (and any parameters that may have been extracted) to the
policy decision point when provided an access request.

We've provided a default function for compiling a principal that matches the
policy to the property ```user-id``` in the ```subject``` property of the access
request.

```typescript
import { principal } from '@dalane/barbican'
const { compilePrincipal } = principal;

const accessRequest:IAccessRequest = {
  action: ...,
  subject: {
    'user-id': '<identifier>'
  },
  resource: ...,
  environment: ...
};
```

Using the provided function for compiling the value for the policy's ```principal```,
the value can also be a wildcard ```*``` to match the policy to all users.

### Actions

An action describes what the subject wants to do with the resource, e.g. read /
write / delete or if using something like CQRS, the name of the command or query
requested.

Policy actions are compiled in a way that a true/false result (and any parameters
that may have been extraced) is passed back to the policy decision point when
passed an access request.

We've provided support for two types of action:

- Command Query Responsibility Segregation; and
- HTML methods.

#### Command/Query Actions

If you've developed your API and services using Command Query Responsibility
Segregation (CQRS) there is a built-in action compiler that matches access
requests to the policy action.

```typescript
import { action } from "@dalane/barbican";
const { compileCommandQueryAction } = action;
```

It requires the policy action to be in the format ```query:<name>``` or
```command:<name>``` where name could also be ```*``` to match all commands or
queries as applicable.

```json
{
  "action": "command:add-user"
}
```

Alternatively, a wildcard could be used for the action to match the policy for
all actions.

```json
{
  "action": "*"
}
```

The CQRS compiler matches the action in the policy the property ```name``` in
the access request. The value of the ```name``` property for commands is
```command:<name>``` and for queries ```query:<name>```.


```typescript
const accessRequest:IAccessRequest = {
  action: {
    name: 'command:add-user'
  }
};
```

#### HTML Method Actions

If you prefer to map your actions to HTML methods (```POST```, ```GET```, ```DELETE```, etc) there is a built-in ```compileHttpAction``` compiler that matches access requests to the policy action.

It requires the policy action to be a HTML verb (```POST```, ```GET```, ```DELETE```, ```PUT```, ```OPTIONS```) or a wildcard ```*``` to match all actions.

```json
{
  "action": "POST"
}

// or...

{
  "action": "*"
}
```

The compiler matches the action in the policy to the property ```method``` in
the ```action``` property of the access request.


```typescript
import { action } from "@dalane/barbican";

const { compileHttpAction } = action;

const accessRequest:IAccessRequest = {
  action: {
    method: 'POST'
  }
};
```

### Resources

The resource element of the policy allows you to target a policy to a specific
resource.

The resource could be a file, a service, a url path, etc that the policy applies
to. The value of the the resource is specified in the policy using the
```resource``` property but depends on the resource compiler you've used.

```json
{
  "resource": "<identifier>"
}
```

#### URL Pattern Resource

We've provided a default function ```compileUrlPatternResource``` in the
```resource``` namespace for matching the policy resource to a URL pattern. The
value for ```resource``` is matched against the access request or you can use a
wildcard ```*``` to match the resource to all access requests.

```json
{
  "resource": "/path/to/resource"
}

// or

{
  "resource": "*"
}
```

The URL pattern is matched against the access request property ```resource.path````.

```typescript
import { resource } from '@dalane/access-control'
const { compileUrlPatternResource } = resource;

const accessRequest:IAccessRequest = {
  action: ...,
  subject: ...,
  resource: {
    path: '/path/to/resource'
  },
  environment: ...
};
```

The url pattern matching is done using the library
[url-pattern](https://www.npmjs.com/package/url-pattern), you can specify
named parameters in the policy resource and these will be returned as parameters to the
policy decision point if a match is found.

For example, given a policy resource of...

```json
{
  "resource": "/path/to/:resource"
}
```

and an access request...

```typescript
const accessRequest = {
  resource: {
    path: '/path/to/1234'
  }
};
```

Will be matched and the named parameter will be merged into the access request
at ```resource.params['named-parameter]```
```typescript
{
  resource: {
    path: '/path/to/1234',
    params: {
      resource: '1234' // this was matched against the URL pattern in the policy...
    }
  }
}
```

See "Using Variables in Specifications" on how you can utilise these values in your policy.

### Specification

The specification section of the policy is an object that contains the
assertions that are tested against the access request.

```json
"specification": {
  "isEqual": {
    "attribute": "subject.name",
    "expected": "John Smith"
  }
}
```

You can specify an empty specification ```specification: {}``` however this
will always return true.

There are two types of
assertion, those that return true or false such as ```isEqual``` or
```isPresent``` and composite assertions that are composed of an array of rules such as
```allOf``` and ```anyOf```.

```json
"specification": {
  "allOf": [
    {
      "isGreaterThanOrEqual": {
        "attribute": "subject.age",
        "expected": 18
      }
    },
    {
      "isTrue": {
        "attribute": "subject.isMember",
        "expected": true
      }
    }
  ]
}
```

Assertions return true or false given an attribute value and an expected value.

They are used in the ```specification``` section of policy as follows:

```json
{
  "<assertion-name>": {
    "attribute": "<attribute-path>",
    "expected": "<expected-value>"
  }
}
```

#### Assertions

The following built-in assertions are available:

Assertion             | Returns true if...
---                   |---
isEqual               | both attribute and expected are equal using "==="
isNotEqual            | the attribute and expected values are not equal using "!=="
isGreaterThanOrEqual  | the attribute is a number and is greater than or equal to the expected value
isGreaterThan         | the attribute is a number and is greater than the expected value
isLessThanOrEqual     | the attribute is a number and is less than or equal to the expected value
isLessThan            | the attribute is a number and is less than the the expected value
isIncluded            | the attribute exists in an array of expected values.
isNotIncluded         | the attribute does not exist in an array of expected values
isNull                | the attribute is null (expected is not required)
isTrue                | the attribute is boolean and is true (expected is not required)
isNotTrue             | the attribute is boolean and is false (expected is not required)
isPresent             | the attribute value is not null or undefined (expected is not required)
isNotPresent          | the attribute value is null or undefined (expected is not required)
isMatch               | the attribute matches an expected regular expression
isNotMatch            | the attribute does not match the expected regular expression
isEquivalent          | the attribute is an object and has the same properties and values as the expected (uses lodash#isEqual)
isNotEquivalent       | the attribute is an object and does not have the same properties and values as the expected

All of the built-in assertions are accessible on the const ```ASSERTIONS```.

You can write your own assertions and use them at run-time by merging them with
the built-in assertions and supplying them to the function that compiles the
specifications.

```typescript

import { specifications } from '@dalane/access-control';
import { merge } from 'lodash'

const {
  ASSERTIONS,
  COMPOSITES,
  makeCompileCompositeAssertions,
  makeCompileAssertions,
  makeCompileSpecification
} = specifications

const myAssertions = {
  isLegalAge: (actual:number):boolean => actual >= 18
}

// you cane combine your custom assertions with the buit-in assertions...
const assertions = merge({}, ASSERTIONS, myAssertions);

// now the assertions compiler will recognise your custom assertions...
const compileAssertionsFn = makeCompileAssertions(assertions);

const compileCompositesFn = makeCompileCompositeAssertions(COMPOSITES);
const compileSpecificationFn = makeCompileSpecification(compileCompositesFn)(compileAssertionsFn);

let policies:IPolicy[] = [
  {
    ...
    specification: {
      isLegalAge: {
        attribute: 'subject.age' // will return false if subject.age is less than 18...
      }
    }
  }
]

```

#### Composite Assertions

The following built-in composite assertions are available:

Assertion           | Returns true if...
---                 |---
allOf               | all assertions in the array return true for this to return true
anyOf               | any assertion in the array can return true for this to return true

All of the built-in composite assertions are accessible on the const ```COMPOSITES```.

You can write your own composite assertions and use them at run-time by merging them with
the built-in composite assertions and supplying them to the function that compiles the
specifications.

The structure of a composite assertions differs from an assertion in that the
assertions are compiled before they are added to the composite assertion.

```typescript

import { specifications } from '@dalane/access-control';
import { merge } from 'lodash'

const {
  ASSERTIONS,
  COMPOSITES,
  makeCompileCompositeAssertions,
  makeCompileAssertions,
  makeCompileSpecification
} = specifications

const myCompositeAssertions = {
  twoOf: (compiledAssertions) => (accessRequest) => {
    const count = compiledAssertions.reduce((count, assertion) => {
      return assertion(accessRequest) ? count + 1 : count;
    }, 0);
    return count === 2;
};

// you cane combine your custom assertions with the buit-in assertions...
const composites = merge({}, COMPOSITES, myCompositeAssertions);

// now the assertions compiler will recognise your custom assertions...
const compileAssertionsFn = makeCompileAssertions(ASSERTIONS);

const compileCompositesFn = makeCompileCompositeAssertions(composites);
const compileSpecificationFn = makeCompileSpecification(compileCompositesFn)(compileAssertionsFn);

let policies:IPolicy[] = [
  {
    ...
    specification: {
      twoOf: [
        { ... },
        { ... },
        { ... },
      ]
    }
  }
]

```

### Obligations

*** THIS IS NOT YET IMPLEMENTED ***

You can specify in a policy, actions that you would like the policy execution point to undertake.
These are known as obligations. They can be specified to be fulfilled on either "Allow" or
"Deny" decisions. An obligation is an action that the PEP must complete and if it can't it must return an error.

A common example given is when a doctor accesses a patient's record, the patient is sent an email.

It is up to the developer to write how obligations and advice are handled in the PEP.

```javascript
{
  ...
  "obligations": [
    {
      "id": "send-notification-email",
      "fulfillOn": "Allow",
      "expression": [
        {
          "property": "message",
          "value": "You're record was accessed."
        },
        {
          "property": "email",
          "attribute": "resource.record.email"
        },
        {
          "property": "accessor-name",
          "attribute": "subject.name"
        }
      ]
    }
  ]
}
```

An obligation that is returned with the decision looks like the following...

```javascript
{
  ...
  obligations: [
    {
      id: 'send-notification-email',
      data: {
        message: 'You\'re record was accessed.',
        email: 'example@example.com',
        'accessor-name': 'Dr Jekyll'
      }
    }
  ]
}
```

## Policy inheritance with ```extends```

Using the optional ```extends``` property. Policies can be merged from parent
policies allowing you to create common policy files and then merge them into one.
This is done by specifying the path to the parent file either using an absolute
path or a relative path.

```json
{
  "extends": "<path-to-parent-policy-file>"
}
```

## Using Variables in Specifications with ```${}```

Instead of hard-coding values in a policy, you can reference variables in the
access request without knowing what the value is. This feature lets you specify
placeholders in a policy.

When the policy is evaluated, the variables are extracted from the access request
and provided to the assertion as the expected value. If the variable can not be
found, ```undefined``` will be used.

To specify variables in your assertions, the template literal format is used by wrapping the property in
```${...}``` such as ```${subject.user.id}```.

In the following example, the authenticated user identified by the variable
"subject.id" must match the ID in the URI of "/users/:id" which can be found at
the variable "resource.params.id".

```json
{
  "specification": {
    "isEqual": {
      "attribute": "subject.user.id",
      "expected": "${resource.params.user_id}"
    }
  }
}
```

Where an attribute on the access request is an array, it can only be utilised
with the ```"isIncluded"``` and ```"isNotIncluded"``` assertions.

## Access Requests

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

You determine what information is included in each property. We have provided some
built-in functions that expect specific properties for matching the access request to
policies which you can find out about in the documentation on each of these
functions.

The access request must contain all the information required to make a decision.
The "Policy Decision Point" will match the request against the registered policies
and then return an "Access Response".

Sources of data for the access request are known as "Policy Information
Points" (PIP). How this is retrieved is left to the developer. In a proprietary
ABAC system, the policy decision point would identify missing attributes and
query each PIP for values itself.

### Subject

The ```subject``` contains the details of the client making the request. Typically
this would be an authenticated user (an authenticated user could still be anonymous).

```typescript
const accessRequest:IAccessRequest = {
  subject: {
    'user-id': 'authenticated-user-id',
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
a method provided. This can be achieved using the predefined principal functions
included or writing your own.

### Action

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

### Resource

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

### Environment

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

## Access Response

The access response is returned by the Policy Decision Point and has the following
interface.

```typescript
enum ACCESS_DECISION {
    ALLOW = 'Allow',
    DENY = 'Deny',
    NOT_APPLICABLE = 'Not-Applicable'
};

interface IAccessResponse {
  request:IAccessRequest;
  decision:ACCESS_DECISION;
  messages:string[];
}
```

It is up to you to handle the access response. You will need to determine how
you respond to ```ACCESS_DECISION.DENY``` and how you handle ```ACCESS_DECISION.NOT_APPLICABLE``` which is returned if there are no policies that match the access request.

Typically, you could wrap this in a "Policy Execution Point" function which
encapsulates the creation of access requests and handles the access response.

```typescript
// implement our policy execution point as express middleware...
const policyExecutionPoint = (policyDecisionPoint) => (request:Request, response:Response, next:NextFunc) => {
  const accessRequest = {
    subject: {
      'user-id': request.authenticatedUser.id
    },
    resource: {
      path: request.url
    },
    action: {
      method: 'GET'
    },
    environment: {
      ip: request.headers['x-forwarded-for'] || request.connection.remoteAddress,
      timestamp: Date.now(),
      userAgent: request.headers['user-agent'],
      dnt: request.headers.dnt
    }
  };
  const accessResponse = policyDecisionPoint(accessRequest);
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