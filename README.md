# access-control
An attribute based access control system for node applications

## Installation

```
npm install --save @dalane\access-control
```

## Policies

Policies can be created using JSON files.

```JSON
{
  "id": "<unique-id-for-your-policy>",
  "name": "<policy-name>",
  "description": "<policy-description>",
  "effect": "< Deny | Allow >",
  "action": "< Create | Read | Update | Delete | * >",
  "resource": "api/users/:userId/relationships/:relationship",
  "principal": ["<user-account-id>"],
  "specification": [
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
  ],
  "obligations": []
}
```

Or they can be created using Plain Javascript Objects.

```javascript
let policy = {
  id: '<unique-id-for-your-policy>',
  name: '<policy-name>',
  description: "<policy-description>",
  effect: "Deny",
  action: "*",
  resource: "api/users/:userId/relationships/:relationship",
  principal: ["<user-account-id>"],
  specification: [
    {
      isTrue: {
        "attribute": "subject.isAdmin"
      }
    },
    {
      isEqual: {
        attribute: "subject.isAdmin",
        expected: "${resource.isAdmin}"
      }
    },
    {
      allOf: [
        {
          isEqual: {
            attribute: "subject.email",
            expected: "example@example.com"
          }
        },
        {
          isGreaterThanOrEqual: {
            attribute: "subject.age",
            expected: 18
          }
        }
      ]
    }
  ],
  obligations: []
}
```

## When you want to compare an attribute to another attribute of the access request
If you wish to compare one property in the request to another property in the request 
then you can enter the full dot notation name of the property as the expected 
value and wrapping it in "${path.to.property}".

```javascript
{
  "isEqual": {
    "attribute": "path.to.property",
    "expected": "${path.to.property.to.compare}"
  }
}
```

## Comparing attributes to the URI
Resource URI comparison is done using the package "url-pattern". This allows you to identify
named parameters and wildcards in the resource URI. As the policies are
being checked by the policy decision point, these parameters and wildcard values
are made available to the rule.

```javascript
"resource": "/record/:id/*",
...
{
  "isEqual": {
    "attribute": "subject.id",
    "expected": "${resource.params.id}"
  },
  "isPresent": {
    "attribute": "resource.params._"
  }
}
```
