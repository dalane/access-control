# Access Control Documentation

This document provides you with the details to get started using
```@dalane/access-control```.

It covers how to:

- structure policies
- use the Policy Administration Point
- create filter functions for the PAP to generate Policy Sets
- set up the the Policy Decision Point
- develop an Access Request
- implement a Policy Execution Point and handle an Access Response
- creat custome assertions to use in policy specifications

## Policies

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

There is an exported helper function ```loadJsonPolicyFiles``` for loading and
parsing these json files. By default it searches for files with the extension ```.policy.json```.

```typescript
import { loadJsonPolicyFiles, IPolicy[] } from '@dalane/access-control';

const baseDir: string = process.env.POLICY_FILES_DIR;
const policies: IPolicy[] = await loadJsonPolicyFiles(baseDir);
```

For detailed information on how to write policies for this library, see the
[policy documentation](https://github.com/dalane/access-control/tree/master/readme/policies.md).


## Policy Administration Point

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
action to an Access Request returning a ```PolicySet``` of filtered policies. This
filtering requires filtering functions to be written by the developer and passed
to the ```createPolicyAdministrationPointFn``` through the ```PolicyDefinitions```
object.

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

For more information on how to write the policy filtering functions see the [filter functions documentation](https://github.com/dalane/access-control/tree/master/readme/filter-functions.md).

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

## Policy Decision Point

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

## Access Requests

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

## Acess Responses

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

## Policy Execution Point

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
