# Attribute Based Access Control libary for your Node.js apps

This package allows you to start with a basic implementation of Attribute Based
Access Control (ABAC) in a node application. It is written using TypeScript so
comes with TypeScript definitions for Typescript development.

## Installation

The package is available for installation from npmjs.com.

```shell
npm install --save @dalane/access-control
```

## Getting Started with ABAC

Access control using an Attribute Based Access Control system is about authorising
(allowing or denying) access to a resource, system, etc by evaluating attributes
of a request against policies instead of roles.

These policies combine boolean rules that allow the combination of various
attributes (about the user requesting access, the resource being accessed, what
action is requested, or the environment within which the request is being made).

For a summary of ABAC see the [wikipedia article](https://en.wikipedia.org/wiki/Attribute-based_access_control) or for a detailed introduction see the NIST ["Guide to Attribute Based Access Control (ABAC) Definition and Considerations"](https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-162.pdf).

### The components of an ABAC system

The components of an Attribute Based Access Control System are:

| Component              | Description
|---                     |---
| Policies               | These define the rules for determining access to the application and resources.
| Policy Administration Point (PAP) | The PAP is where policies are managed.
| Policy Decision Point (PDP)  | The PDP takes an Access Request, requests policies from the PAP that match the Access Request, validates each returned policy against the Access Request, and then returns an Access Response with the PDP decision.
| Access Request         | This contains the attributes to be validated against the policies by the PDP.. These attributes could include details on the user making the request, the resource being accessed and details on the action to be applied to the resource.
| Access Response        | The Access Response is returned by the Policy Decision Point and contains the decision made by the PDP. It will include an Access Decision indicating that the request is allowed or denied. It may also indicate a not applicable decision indicating that no matching policies were found.
| Policy Execution Point (PEP) | The PEP is responsible for creating the Access Request, passing it to the PDP and handling the Access Response.
| Policy Information Point (PIP) | PIPs are used by the PDP to populate any attributes required by the policy rules that are missing from an Access Request (this library doesn't implement PIPs).

## How this libary implements ABAC

### Policies

Policies contain the access rules for determining if a user has access to a resource.
They determine which attributes in the Access Request will result in an ```Allow```
or ```Deny``` decision.

They can be JSON files or plain javascript objects. An example of a JSON policy
is below.

```JSON
{
  "version": 1,
  "extends": "<relative path to policy file>",
  "id": "<unique-id-for-your-policy>",
  "name": "<a human friendly name for your policy>",
  "description": "<a human friendly description of your policy>",
  "effect": "< Deny | Allow >",
  "action": "<schema>:<pattern>",
  "resource": "<schema>:<pattern>",
  "principal": "<schema>:<pattern>",
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

To keep things simple, this style is similar to the AWS policy files instead of
the XAMCL format (using XML) referenced in the Wikipedia article. They are easier
to read and understand and don't have all the extra work of an XML document.

There is an exported helper function ```loadJsonPolicyFiles``` for loading and
parsing these json files. By default it searches for files with the extension ```.policy.json```.

```typescript
import { loadJsonPolicyFiles, IPolicy[] } from '@dalane/access-control';

const baseDir: string = process.env.POLICY_FILES_DIR;
const policies: IPolicy[] = await loadJsonPolicyFiles(baseDir);
```

For detailed information on how to write policies for this library, see the
[policy documentation](https://github.com/dalane/access-control/tree/master/readme/policies.md).


### Policy Administration Point

The Policy Administration Point is where policies are added, compiled and matched
to Access Requests. It is required by the Policy Decision Point to filter policies
that match the Access Request and return the matched policies for the PDP to
then determine if the policy rules are satisified.

A full Policy Administration Point would include functions for managing policy
files including adding, editing and deleting. This library only supports files
loaded during intialisation.

The Policy Administration Point in this library uses function composition to
create a ```PolicyAdministrationPointFn```.

```typescript
type PolicyAdministrationPointFn = (accessRequest: IAccessRequest) => PolicySet;
```

The Policy Administration Point function matches a principal, resource and/or
action to an Access Request returning a ```PolicySet``` of matching policies. The
matching of principal, resource and/or action requires the matching functions to
be written by the developer and passed to the ```createPolicyAdministrationPointFn```
through the ```PolicyDefinitions``` object.

```typescript
import { createPolicyAdministrationPointFn, PolicyAdministrationPointFn, PolicyDefinitions } from '@dalane/access-control';

const definitions: PolicyDefinitions = {
	actions: [...],
	resources: [...],
	principals: [...]
};

// create the policy administration point function noting that we need to have
// loaded the policies first
const pap: PolicyAdministrationPointFn = createPolicyAdministrationPointFn(policies, definitions);
```

For more information on how to write the policy matching functions see the [filter functions documentation](https://github.com/dalane/access-control/tree/master/readme/filter-functions.md).

As the Policy Administration Point compiles the policies, custom assertions can
also be added through the ```PolicyDefinitions``` object.

```typescript
import { PolicyDefinitions } from '@dalane/access-control';

const definitions: PolicyDefinitions = {
  // also include
  specifications: {
    arrays: { ... }, // custom array assertions
    assertions: { .... } // custom attribute assertiongs
  }
};
```

For more information on how to write custom assertions see the [assertions documentation](https://github.com/dalane/access-control/tree/master/readme/assertions.md).

### Policy Decision Point

The policy decision point is where policies are matched to requests to access a
resource. The request to access a resource is defined using an access request. The
policy decision point will match the access request to the policies returning an
access response with the PDP's decision.

This decision will indicate either an ALLOW decision or a DENY decision. If the PDP
is unable to match a policy to the request then a NOT-APPLICABLE decision will be returned.

The policy decision point is created using the ```createPolicyDecisionPointFn```
function. It uses function composition to return a function with the type ```PolicyDecisionPointFn``` and requires the Policy Administration Point function.

```typescript

import { createPolicyDecisionPointFn, PolicyDecisionPointFn, IAccessResponse } from '@dalane/access-control';

const pdp: PolicyDecisionPointFn = createPolicyDecisionPoint(pap);

const accessResponse: IAccessResponse = pdp(accessRequest);

```

### Access Requests

The Policy Decision Point takes an Access Request and uses it to determine what
the Access Response will be.

An Access Request must contain all the information about the request including what
resource is being requested (resource), who is making the request (subject), the
context of the request (environment), and the requested action to be applied to
the resource (action).

The Access Request is created as a "Plain Old Javascript Object" however there
is a Typescript interface for convenience IAccessRequest in the accessRequest
namespace.

```typescript
interface IAccessRequest {
	subject: {
		[index: string]: any
	}
	action: {
		[index: string]: any
	}
	resource: {
		[index: string]: any
	}
	environment: {
		[index: string]: any
	}
}
```

You determine what information is included in each property.

```typescript
import { IAccessRequest, IAccessResponse } from '@dalane/access-control';

const accessRequest: IAccessRequest = { ... };

const accessResponse: IAccessResponse = pdp(accessRequest);
```

See the [Access Request documentation](https://github.com/dalane/access-control/tree/master/readme/access-request.md) for more information on implementing an Access Request.

### Acess Responses

The Access Response is returned from the Policy Decision Point when it is called
with an Access Request. It indicates if the decision for access is allowed or denied.

```typescript
interface IAccessResponse {
  decision: ACCESS_DECISION;
  messages?: string[];
  failedPolicies?: IPolicy[];
}

enum ACCESS_DECISION {
	ALLOW = 'Allow',
	DENY = 'Deny',
	NOT_APPLICABLE = 'Not-Applicable'
};
```

If the decision is ```ACCESS_DECISION.DENY``` it will include an of messages
indicating what failed and an array of the policies that failed.

```typescript
import { IAccessResponse } from '@dalane/access-control';

const accessResponse: IAccessResponse = pdp(accessRequest);
```

It is up to the developer to handle the access response. They will need to
determine how to respond to ```ACCESS_DECISION.DENY``` and how to handle an
```ACCESS_DECISION.NOT_APPLICABLE``` which is returned if there are no policies that match the access request.

Typically, this would be handled in a "Policy Execution Point" which encapsulates
the creation of access requests and handles the access response.

### Policy Execution Point

A Policy Execution Point (PEP) is where the access request is created, calls
the Policy Decision Point with the Access Request and handles the Access Response.

It is up to the developer to develop the PEP to suit the requirements of the
application. An indicative approach of a PEP is below.

```typescript
import { PolicyDecisionPointFn, IAccessRequest, IAccessResponse, ACCESS_DECISION } from '@dalane/access-control';

function createPolicyExecutionPoint(pdp: PolicyDecisionPointFn) {

	/// create the access request
	const accessRequest: IAccessRequest = { ... };

	// call the pdp with the access request getting back an access response
	const accessResponse: IAccessResponse = pdp(accessRequest);

	// do something with the access response...

	switch (accessResponse.decision) {
		case ACCESS_DECISION.ALLOW:
			// handle allow decision...
			break;
		case ACCESS_DECISION.DENY: {
			// handle deny decision...
			break;
		}
		default:
			// handle the ACCESS_DECISION.NOT_APPLICABLE
	}

}
```

See the [Policy Execution Point documentation](https://github.com/dalane/access-control/tree/master/readme/policy-execution-point.md)
for more information.

### Policy Information Points

This library doesn't implement PIPs. Each Access Request needs to include the
attributes that would be required for each policy decision.


