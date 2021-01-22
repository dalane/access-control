# Filter functions

Filter functions are used by the Policy Administration Point generate a policy
set from all of the loaded policies against an access request.

A filter function implements the type ```PolicySchemeMatchDefinition```.



It requires the implementation of the Interface ```PolicyDefinition```.

```typescript
interface PolicyDefinitions {
	actions: PolicySchemeMatchDefinition[];
	principals: PolicySchemeMatchDefinition[];
	resources: PolicySchemeMatchDefinition[];
	specification?: {
		arrays?: IArrayAssertions;
		assertions?: IAssertions;
	};
}
```

In the interface above, ```actions```, ```principal``` and ```resource```
are used by the policy decision point to filter the policies down to a policy set
that matches the access reqeust. These are required to be developed by the
developer for the specific requirements of their application. See
[policy sets](https://github.com/dalane/access-control/tree/master/readme/policy-sets.md)
for how to write functions that filter policies into a policy set from an access
request.

The value for ```specifications``` contain functions that extend (or overwrite)
the built-in assertions (e.g. ```isEqual``` for assertions and ```allOf``` for array assertions) that determine if access request is satisfied by the policy. See
[specification assertions](https://github.com/dalane/access-control/tree/master/readme/assertions.md)
for how to write custom assertions.


The example below shows how to populate the policy definitions object.

```typescript

import { PolicyDefinitions, IAccessRequest, isSatisfiedByResult } from '@dalane/access-control';

const definitions: PolicyDefinitions = {
	// the developer needs to provide actions, principal and resource matching
	// functions. These are used to filter policies into a policy set relevant
	// to an access request
	actions: [
		{
			scheme: 'operationid',
			matchFn: (pattern: string) => (accessRequest: IAccessRequest) => {
				return accessRequest?.action?.operationid === pattern ? isSatisfiedByResult(true) : isSatisfiedByResult(false);
			},
		}
	],
	principals: [
		{
			scheme: 'userid',
			matchFn: (pattern: string) => (accessRequest: IAccessRequest) => {
				return accessRequest?.subject?.userid == pattern ? isSatisfiedByResult(true) : isSatisfiedByResult(false);
			},
		}
	],
	resources: [
		{
			scheme: 'resourceid',
			matchFn: (pattern: string) => (accessRequest: IAccessRequest) => {
				return accessRequest?.resource?.resourceid == pattern ? isSatisfiedByResult(true) : isSatisfiedByResult(false);
			},
		}
	],
	// specification is optional. Only need to provide if the developer wishes to
	// add their own assertions
	specification: {
		arrays: {
			oneOf: (compiledAssertions: ISpecificationMatchFn[]): ISpecificationMatchFn => {
				if(Array.isArray(compiledAssertions) === false) {
					throw new Error('#oneOf requires an array of compiled specifications');
				}
				return (accessRequest: IAccessRequest) => {
					// if there are no rules then we return true by default...
					if (compiledAssertions.length === 0) {
						return false;
					}
					let isTrueCount: number = 0;
					compiledAssertions.forEach((assertion: IIsSatisfiedByFn) => {
						if (assertion(accessRequest) === true) {
							isTrueCount++;
						}
					});
					return isTrueCount === 1;
				};
			}
		},
		assertions: {
			isUuid: (actual: any, expected: any) => {
				// we will ignore expected as it is not required to verify that the actual
				// value is a UUID
				const uuid_regexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
				return uuid_regexp.match(actual);
			}
		},
	},
};
```
