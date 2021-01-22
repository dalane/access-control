# Filter functions

Filter functions are used by the Policy Administration Point to generate a policy
set from an access request. A policy set is all of the policies that match an
access request on ```principal```, ```resource```, and / or ```action```. The
Policy Set is returned to the Policy Decision Point to make a determination on
whether to allow or deny an access request.

A filter function implements the type ```PolicyFilterFn```.

```typescript
type PolicyFilterFn = (pattern: string) => IsPolicyMatchFn;
type IsPolicyMatchFn = (accessRequest: IAccessRequest) => IIsSatisfiedByResult;
```

Basically, a filter function is provided a ```value``` from a policy and returns
another function that takes an Access Request and returns a result indicating
if the filter function has matched the value in the Access Request.

The example below shows how to create a filter function.

```typescript
import { IAccessRequest, isSatisfiedByResult, IIsSatisfiedByResult, PolicyFilterFn } from '@dalane/access-control';

const filterOperationIdFn: PolicyFilterFn = (pattern: string): IsPolicyMatchFn => {
	return (accessRequest: IAccessRequest): IIsSatisfiedByResult => {
		const operationId = accessRequest?.action?.operationId;
		if (operationId === undefined) {
			return isSatisfiedByResult(false);
		}
		return operationid === pattern ? isSatisfiedByResult(true) : isSatisfiedByResult(false);
	};
}
```

Filter functions are passed to the Policy Administration Point when creating the
PAP through the ```PolicyDefinitions``` object.

```typescript
import { createPolicyAdministrationPointFn, PolicyAdministrationPointFn, PolicyDefinitions } from '@dalane/access-control';

const definitions: PolicyDefinitions = {
	actions: {
		// [scheme: string]: PolicyFilterFn
		operationid: filterOperationIdFn,
	},
	// register for principal and resource filter functions...
};

const pap: PolicyAdministrationPointFn = createPolicyAdministrationPointFn(policies, definitions);

```

To use these filter functions in a policy they must use the
