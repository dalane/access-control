# Assertions

Assertions are used in a policy specification to determine if the attributes in
an access request are valid for that policy.

```json
{
  "<assertion-name>": {
    "attribute": "<attribute-path>",
    "expected": "<expected-value>"
  }
}
```

There are two types of assertion: those that return true or false such as
```isEqual``` or ```isPresent```; and array assertions that are composed of an
array of assertions such as ```allOf``` and ```anyOf```.

## Attribute Assertions

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

### Array Assertions

Array assertions will return a true or false result based on the value of each
assertion in the array. They are written into the specification as follows.

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

Array assertions can be nested and / or combined with attribute assertions.

The following built-in array assertions are available:

Assertion           | Returns true if...
---                 |---
allOf               | all assertions in the array return true for this to return true
anyOf               | any assertion in the array can return true for this to return true

## Using Variables in an assertion with ```${}```

Instead of hard-coding values in a policy, you can reference variables in the
access request without knowing what the value is. This feature lets you specify
placeholders in a policy.

When the policy is evaluated, the variables are extracted from the access request
and provided to the assertion as the expected value. If the variable can not be
found, ```undefined``` will be used.

To specify variables in your assertions, wrap the property name (using dot-notation
to access nested values) in ```${...}``` such as ```${resource.params.user_id}```.

In the following example, the authenticated user identified by the variable
"subject.userid" must match the ID in the URI of "/users/:userid" which will
be found at the property "resource.params.userid".

```json
{
  "specification": {
    "isEqual": {
      "attribute": "subject.userid",
      "expected": "${resource.params.userid}"
    }
  }
}
```

Where an attribute on the access request is an array, it can only be utilised
with the ```"isIncluded"``` and ```"isNotIncluded"``` assertions.

## Custom assertions

You can write your own assertions and add them at run-time when composing the
PAP using the definitions object.

```typescript
import { createPolicyAccessPointFn, PolicyDefinitions, } from '@dalane/access-control';

// custom assertions are added to the specifications parameter as per the type
// of assertion
const definitions: PolicyDefinitions = {
	...
	specifications: {
		arrays: {
			// <array-assertion-name>: <array-assertion-function>,
		},
		assertions: {
			// <attribute-assertion-name>: <attibute-assertion-function>,
		}
	}
};

// create the PAP function supplying an array of policies and the definitions
// including any custom assertions
const pap = createPolicyAccessPointFn(policies, definitions);
```

Both array and attribute assertions can be created although each implements a
slightly different interface.

When defining the assertions in the ```PolicyDefinitions``` object, the key name
is the value used in the policy.

```typescript
const definitions: PolicyDefinitions = {
	specifications: {
		arrays: {
			// custom assertion key here is used in thr policy document
			lastOf: lastOfArrayAssertionFn,
		}
		assertions: {
			// custom assertion key here is used in thr policy document
			isUuid: isUuidAssertionFn,
		},
	},
};

const policy: IPolicy = {
	specification: {
		// array assertion name here is the key defined in the definitions above
		lastOf: [
			// assertion name here is defined as the key name when
			// defining the custom assertion
			isUuid: {
				actual: 'subject.userid'
			},
			// more assertions if required...
		]
	}
}
```

### Custom attribute assertions

Custom attribute assertions are functions that implement the type ```AssertionFn```.

```typescript
type AssertionFn = (actual: any, expected: any) => boolean;
```

For example:

```typescript
import { AssertionFn } from '@dalane/access-control';

const isUuidAssertionFn: AssertionFn = (actual: string, expected?: any) => {
	return uuid_regexp.match(actual);
};
```

### Custom array assertions

Array assertions implement the type ```ArrayAssertionFn```.

```typescript
type ArrayAssertionFn = (rules: SpecificationMatchFn[]) => SpecificationMatchFn;
```

As can be seen in the type above, array assertion functions take a parameter
```rules``` which is an array of functions that have the type signature
```SpecificationMatchFn``` and returns a function that also has the same type.

The ```SpecificationMatchFn``` type function applies the access request to an
assertion. Therefore an array assertion takes an array of compiled assertions,
applies an access request to each assertion in the rules array and then returns a
boolean result on whether or not the rules in the array assertion were satisfactory.

A ```SpecificationMathFn``` could be either an array assertion or an attribute
assertion. This allows for complex and nested assertion rules to be built up with
out the assertion function needing to know as all it does is call the function
with an access request and get back a true or false result.

```typescript
import { ArrayAssertionFn, IAccessRequest, SpecificationMatchFn } from '@dalane/access-control';

const lastOfArrayAssertionFn: ArrayAssertionFn = (specificationMatchFns: SpecificationMatchFn[]): SpecificationMatchFn => {
	return (accessRequest: IAccessRequest): boolean => {
		const lastIndexOf = specificationMatchFns.length - 1;
		const isSatisfiedBy: boolean = specificationMatchFns[lastIndexOf](accessRequest);
		return isSatisfiedBy;
	};
};
```
