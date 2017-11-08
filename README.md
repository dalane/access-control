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

## Resource parameters and wildcards
You can specify named parameters and wildcards in the resource URI. This is provided by the library url-pattern.
More information can be found at https://www.npmjs.com/package/url-pattern.

Named parameters are extracted from the URI and are available to the policy (but not other policy)
at the attribute "resource.params.<name-of-parameter>". Wildcard values are available at
the attribute "resource.params._" however this value is an array and we don't yet
support accessing array attributes by index so it can only be utilised with "isIncluded"
and "isNotIncluded" rule specifications.

## Using variables
You can use variables, a feature that lets you specify placeholders in a policy. When the policy is evaluated, the variables are replaced with values that come from the request itself. If the variable can not be found in the request, the Policy Decision Point will try and find it using the Policy Information Point.

In the following example, the authenticated user identified by the variable "subject.id" must match the ID in the URI of "/users/:id" which can be found at the variable "resource.params.id".

```javascript
{
  "name": "EditUserRecords",
  "description": "Users can only edit their own records.",
  "effect": "Allow",
  "action": "*",
  "resource": "/users/:id(/*)",
  "rule": [
    {
      "isEqual": {
        "attribute": "subject.id",
        "expected": "${resource.params.id}"
      }
    }
  ]
}
```

## Comparing attributes to the URI
Resource URI comparison is done using the package "url-pattern". This allows you to identify
named parameters and wildcards in the resource URI. As the policies are
being checked by the policy decision point, these parameters and wildcard values
are made available to the rule.

```javascript
{
  "resource": "/record/:id/*",
  ...
  "rule": [
    {
      "isEqual": {
        "attribute": "subject.id",
        "expected": "${resource.params.id}",
        "comment": "The parameter \":id\" in the resource uri can be accessed at \"resource.params.id\"."
    },
    {
      "isPresent": {
        "attribute": "resource.params._",
        "comment": "The wildcard \"*\" can be accessed at \"resource.params._\" as an array. Accessing by index is not currently possible."
    }
  ]
}
```

## Obligations
You can specify in a policy, actions that you would like the policy execution point to undertake.
These are known as obligations. They can be specified be fulfilled on either "Allow" or
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
