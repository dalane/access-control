# Access Response

The access response is returned by the Policy Decision Point and has the following
interface.

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

It is up to the developer to handle the access response. They will need to
determine how to respond to ```ACCESS_DECISION.DENY``` and how to handle an
```ACCESS_DECISION.NOT_APPLICABLE``` which is returned if there are no policies that match the access request.

Typically, this would be handled in a "Policy Execution Point" which encapsulates
the creation of access requests and handles the access response.
