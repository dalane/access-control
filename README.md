# Attribute Based Access Control libary for your Node.js apps

The node package ```@dalane/access-control``` is an attribute based access
control (ABAC) system for node applications.

For more information on ABAC see the ["Guide to Attribute Based Access Control (ABAC) Definition and Considerations"](https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-162.pdf)

## Installation

```
yarn add @dalane/access-control
```

or

```
npm install --save @dalane/access-control
```

## Attribute Based Access Control

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



## Policies

Policies can be created using JSON files.

```JSON
{
  "version": 1,
  "extends": "<relative path to policy file>",
  "id": "<unique-id-for-your-policy>",
  "name": "<a human friendly name for your policy>",
  "description": "<a human friendly description of your policy>",
  "effect": "< Deny | Allow >",
  "action": "< Create | Read | Update | Delete | * >",
  "resource": "/api/users/:userId/relationships/:relationship",
  "principal": "<user-account-id>",
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
  },
  "obligations": []
}
```

Or they can be created using Plain Javascript Objects using the same structure.

#### Version

Currently, there is only one version supported. Therefore the version should be
set to 1.

```json
{
  "version": 1
}
```

#### ID

Providing a unique ID for your policy helps with identifying which policies
were used by the decision point and tracing errors. This is provided by you and
is not a system generated identifier.

```json
{
  "id": "<unique-policy-id>"
}
```

#### Principal

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
import { compilePrincipal } from '@dalane/barbican'

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

#### Actions

An action describes what the subject wants to do with the resource, e.g. read /
write / delete or if using something like CQRS, the name of the command or query
requested.

Policy actions are compiled in a way that a true/false result (and any parameters
that may have been extraced) is passed back to the policy decision point when
passed an access request.

We've provided support for two types of action:

- Command Query Responsibility Segregation; and
- HTML methods.

##### Command/Query Actions

If you've developed your API and services using Command Query Responsibility
Segregation (CQRS) there is a built-in action compiler that matches access
requests to the policy action.

```typescript
import { compileCommandQueryAction } from "@dalane/barbican";
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

##### HTML Method Actions

If you prefer to map your actions to HTML methods (```POST```, ```GET```, ```DELETE```, etc) there is a built-in action compiler that matches access requests to the policy action.

```typescript
import { compileHttpAction } from "@dalane/barbican";
```

It requires the policy action to be a HTML verb (```POST```, ```GET```, ```DELETE```, ```PUT```, ```OPTIONS```).

```json
{
  "action": "POST"
}
```

Alternatively, a wildcard could be used for the action to match the policy for
all actions.

```json
{
  "action": "*"
}
```

The compiler matches the action in the policy the property ```method``` in
the ```action``` property of the access request. The value of the ```method```
property must be a HTTP verb.


```typescript
const accessRequest:IAccessRequest = {
  action: {
    method: 'POST'
  }
};
```

#### Resources

The resource element of the policy allows you to target a policy to a specific
resource.

The resource could be a file, a service, a url path, etc that the policy applies
to. The value of the the resource is specified in the policy using the
```resource``` property.

```json
{
  "resource": "<identifier>"
}
```

The value for ```resource``` is compiled into a function that returns a
true/false result (and any parameters that may have been extracted) to the
policy decision point when provided an access request.

We've provided a default function for compiling a resource that matches the
policy to a URL pattern. This is specified in the property ```path``` of the
```resource``` property of the access request.

```typescript
import { compileUrlPatternResource } from '@dalane/access-control'

const accessRequest:IAccessRequest = {
  action: ...,
  subject: ...,
  resource: {
    path: '/path/to/resource'
  },
  environment: ...
};
```

Using the provided function for compiling the value for the policy's ```resource```,
the value can also be a wildcard ```*``` to match the policy to all resources.

```json
{
  "resource": "*"
}
```

If a path has been provided, the url pattern matching is done using the library
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

Will be matched and the named parameter ```resource``` will be returned to the
policy decision point and merged into the access request for that policy as
```typescript
{
  resource: {
    path: '/path/to/1234',
    params: {
      resource: '1234'
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
```isPresent``` and those that are composed of an array of rules such as
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

#### Assertions

Assertions return true or false given an attribute value and an expected value.

They are used in the ```specification``` section of policy as follows:

```json
{
  "<assertion-name>": {
    "attribute": "<attribute-path>", // required
    "expected": "<expected-value>", // is not required for all assertions
    "options": {} // optional
  }
}
```

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
---

All of the built-in assertions are accessible on the const ```ASSERTIONS```.

You can write your own assertions and use them at run-time by merging them with
the built-in assertions and supplying them to the function that compiles the
specifications.

```javascript
interface IAssertion {
  (attribute:any, expected?:any, options?:any):boolean
}

import { ASSERTIONS, COMPOSITES,  compileAssertions, compileSpecification } from '@dalane/access-control';
import * as _ from 'lodash'

const assertions = _.merge({}, ASSERTIONS, myAssertions);
const myCompileSpecificationFunc = compileSpecification(compileAssertions)(COMPOSITES, assertions);
```

#### Using Variables in Specifications

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

```javascript
{
  "name": "EditUserRecords",
  "description": "Users can only edit their own records.",
  "effect": "Allow",
  "action": "*",
  "resource": "<service>:/accounts/users/:user_id(/*)",
  "specification":{
    "isEqual": {
      "attribute": "subject.user.id",
      "expected": "${resource.params.user_id}"
    }
  }
}
```

Where a property contains an array (such as ```resource.params```), it can only
be utilised with the ```"isIncluded"``` and ```"isNotIncluded"``` rule
specifications. We don't yet support accessing array attributes by index.

## Obligations

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

### Poicy inheritance with ```extends```

Using the optional ```extends``` property. Policies can be merged from parent
policies allowing you to create common policy files and then merge them into one.
This is done by specifying the path to the parent file either using an absolute
path or a relative path.

```json
{
  "extends": "<path-to-parent-policy-file>"
}
```

## Access Request

An access request contains all the information about the request including what
resource is being requested (resource), who is making the request (subject), the
context of the request (environment), and the requested action to be applied to
the resource (action).

The access request is created as a "Plain Old Javascript Object" however there
is a Typescript interface for convenience IAccessRequest.

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

You determine what information is included in each property. We have developed
some convenience functions that requires specific properties and formats to
identify a Policy Set that applies to each request. You can provide your own
function or utilise our own standardised functions for generating policy sets.

See the section below on Policy Sets for more information.

### Environment

Properties of the environment such as IP address, user agent paramaters,
protocol (tcp/http), encryption method, client type, request counts made by
subject, etc...

```typescript
const accessRequest:IAccessRequest = {
  action: ...,
  subject: ...,
  resource: ...,
  environment: {
    'client-id': 'client-id',
    ip: '198.0.0.1',
    device: 'mobile'
  }
};
```

The access request must contain all the information required to make a decision.
It will be passed the "Policy Decision Point" which will match the request
against the available policies and then return an "Access Response".

Sources of data for the access request are known as "Policy Information
Points". How this is retrieved is left to the developer.

## Policy Sets

A policy set is a collection of policies that apply to the subject, action and
resource of each request. It is up to the developer to generate the policy set
for each request.

Your function is required to return an array of matching policies with each
policy returned in an object as follows:

```typescript
interface IFoundPolicy {
  policy:IPolicy // the matched policy
  params:any // any params that may have been matched using regular expressions or other pattern matching
  _:any[] // if you have any non-names parameters they
}
```

For you convenience, we've provided a function ```findPolicySet``` that iterates
through the compiled policies and validates them to the access request.

```typescript
import { findPolicySet } from "@dalane/access-control";

const policies = [...]; // an array containing the compiled policies...
const pdp = policyDecisionPoint();
```

If the following properties:

- principal
- resource
- action

are missing from the policy (for example, in base policies that you are using
to extend other policies) then that policy will not be included in any policy set as
these will return false on any request to match to an access request.

## Access Response

```typescript
enum ACCESS_DECISION {
    ALLOW = 'Allow',
    DENY = 'Deny'
}

interface IAccessResponse {
  request:IAccessRequest
  decision:ACCESS_DECISION
  messages:string[]
  obligations:IObligation[]
}
```
