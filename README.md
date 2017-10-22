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
