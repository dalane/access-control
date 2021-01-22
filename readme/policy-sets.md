# Policy Sets

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

The value for each resource must be a string. The compiler matches these values
using a "schema" parameter which tells the compiler which schema to use to determine
if the policy is matched to the resource.

```javascript
{
	"resource": "<schema:><schema-pattern>"
}
```

The following are built-in resource schemas:

| schema | description |
| :--- | :---|
| ```path:``` | Uses a URL pattern matcher to match the pattern defined in the schema to the access request ```resource.path``` parameter. For example ```{ resource: "path:/path/to/resource" }``` will be matched to the access request ```{ resource: { path: "/path/to/resource" } }```. When building your access request you must ensure that ```resource.path``` is defined. |

### URL Pattern Resource

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
