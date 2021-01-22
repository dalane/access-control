# Policies

Policies are the foundation of the attribute based access control system.

Policies can be JSON files or plain javascript objects. An example of a policy
is below. This is similar to the way AWS implements policies. There is an XML
standard for ABAC called XACML but this library takes the approach of trying to
keep it simple.

If using JSON files for policies, they can be read using the exported asynchronous
function ```loadJsonPolicyFiles```. It takes two arguments: the first argument
is the base folder of the policies; and the second argument is optional indicating
the filename pattern to match to policy files. The default pattern is ```**/*.policy.json``` to match all files using a recursive find with the file extension
```.policy.json```

```typescript
import { loadJsonPolicyFiles, IPolicy } from '@dalane/access-control';

const policies: IPolicy[] = await loadJsonPolicyFiles(process.env.PATH_TO_POLICIES);
```

Policies are added to the Policy Administration Point for the Policy Decision
Point to retrieve relevant policies and validate them against an Access Request.

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

## Version

Currently, there is only one version supported. Therefore the version should be
set to 1.

```json
{
  "version": 1
}
```

## Identification

Providing a unique ID for your policy helps with identifying which policies
were used by the decision point and tracing errors. This is provided by you and
is not a system generated identifier.

```json
{
  "id": "<unique-policy-id>"
}
```

## Policy Target

A policy is targetted to a user or resource and the type of action being performed
on that resource.

These are captured by the ```principal```, ```resource``` and ```action``` properties
of the policy.

```json
{
  "principal": "<schema>:<pattern>",
  "resource": "<schema>:<pattern>",
  "action": "<schema>:<pattern>"
}
```

Alternatively you may want to target your policy to multiple targets. Each value
also accepts an array of values.

```json
{
  "principal": [ "<schema>:<pattern-one>", "<schema>:<pattern-two>" ],
  "resource": [ "<schema>:<pattern-one>", "<schema>:<pattern-two>" ],
  "action": [ "<schema>:<pattern-one>", "<schema>:<pattern-two>" ]
}
```

The values for ```principal```, ```resource``` and ```action`` are compiled into
functions that that are used by the Policy Administration Point to filter matching
policies to an access request.

Each identifier needs to include a schema prefix separated by a colon to indicate
which pattern matcher will be used to match the policy to the access request (```"<scheme>:<pattern>"```). The scheme and the function to determine if the
pattern is a match to the policy is defined by the developer to suit their
application. This is further explained in the [filtering document](https://github.com/dalane/access-control/tree/master/readme/filtering.md).

Alternatively, a wildcard ```*``` can be used to match the principal to all requests.

### Principal

The principal element of the policy allows you to target a policy to a user or a
service.

A principal is a user, role, group, service, etc that the policy applies to. The
identify of the principal is specified in the policy using the ```principal```
property. It can be a single value or an array if the policy applies to more than
one principal.

### Actions

The action element of the policy allows you to target a policy to the action being performed on the resource.

The action is specified in the policy using the ```action``` property. It can be a single value or an array if the policy applies to more than one action.

### Resources

The resource element of the policy allows you to target a policy to a specific
resource.

The resource could be a file, a service, a url path, etc that the policy applies
to. The value of the the resource is specified in the policy using the
```resource``` property. It can be a single value or an array if the policy
applies to more than one resource.

## Specification

The specification section of the policy is an object that contains the
assertions that are tested against the access request.

They are used in the ```specification``` section of policy as follows:

```json
{
  "specification": {
    "<assertion-name>": {
      "attribute": "<attribute-path>",
      "expected": "<expected-value>"
    }
  }
}
```
Assertions return true or false given an attribute name and an expected value. The
Policy Decision Point will parse the access request for the attribute name and
assert that the actual value meets the assertion rule relative to the expected value.

You can specify an empty specification ```specification: {}``` however this
will always return true.

Detailed specifications can be built up using a combination of array and
attribute assertions.

```json
{
  "specification": {
    anyOf: [
      {
        "isEqual": {
          "attribute": "subject.name",
          "expected": "John Smith"
        }
      },
      {
        "isTrue": {
          "attribute": "subject.isAdmin"
        }
      },
      allOf: [
        {
          "isGreaterThanOrEqual": {
            "attribute": "subject.age",
            "expected": 18
          }
        },
        {
          "isFalse": {
            "attribute": "environment.dnt"
          }
        }
      ]
    ]
  }
}
```

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

## Policy inheritance with ```extends```

Using the optional ```extends``` property. Policies can be merged from parent
policies allowing you to create common policy files and then merge them into one.
This is done by specifying the path to the parent file either using an absolute
path or a relative path.

```json
{
  "extends": "<path-to-parent-policy-file>"
}
```


