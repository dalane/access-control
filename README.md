# Attribute Based Access Control library for your Node.js apps

This package allows you to start with a basic implementation of Attribute Based
Access Control (ABAC) in a node application. It is written using TypeScript so
comes with TypeScript definitions for Typescript development.

## Installation

The package is available for installation from npmjs.com.

```shell
npm install --save @dalane/access-control
```

## Getting Started with ABAC

Access control using an Attribute Based Access Control system is about authorising
(allowing or denying) access to a resource, system, etc by evaluating attributes
of a request against policies instead of roles.

These policies combine boolean rules that allow the combination of various
attributes (about the user requesting access, the resource being accessed, what
action is requested, or the environment within which the request is being made).

For a summary of ABAC see the [wikipedia article](https://en.wikipedia.org/wiki/Attribute-based_access_control) or for a detailed introduction see the NIST ["Guide to Attribute Based Access Control (ABAC) Definition and Considerations"](https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-162.pdf).

### The components of an ABAC system

The components of an Attribute Based Access Control System are:

| Component              | Description
|---                     |---
| Policies               | These define the attributes and rules for determining access to the application and resources.
| Policy Administration Point (PAP) | The PAP is where policies are managed.
| Policy Decision Point (PDP)  | The PDP takes an Access Request, requests the PAP to find and return policies that match the Access Request, validates each returned policy against the Access Request, and then returns an Access Response with an access decision.
| Access Request         | This contains the attributes to be validated against policies by the PDP. These attributes could include details on the user making the request, the resource being accessed and details on the action to be applied to the resource.
| Access Response        | The Access Response is returned by the Policy Decision Point and contains the decision made by the PDP. It will include an Access Decision indicating that the request is allowed or denied. It may also return a not applicable decision indicating that no matching policies were found.
| Policy Execution Point (PEP) | The PEP is responsible for creating the Access Request, passing it to the PDP and handling the Access Response.
| Policy Information Point (PIP) | PIPs are used by the PDP to populate any attributes required by the policy rules that are missing from an Access Request.

## How this libary implements ABAC

This library simplifies a lot of an Attribute Based Access Control system however
there are still a lot of components, types and interfaces to make it all work
together. For example, the Policy Administration Point only retrieves policies
for the Policy Decision Point, there is no management.

The style of policy documents is similar to the AWS policy files instead of
the XAMCL format (using XML) referenced in the Wikipedia article. They are easier
to read and understand, and don't have all the extra overhead of an XML document.

Policies and the Policy Decision Point do not support the use of Obligations. These
would be sent to the Policy Execution Point as part of the Access Response which
the PEP would be obligated to undertake.

There is no implementation for Policy Information Points at this time. Each
Access Request needs to contain all of the information that would be needed
to validate the request against the relevant policies.

### Examples

A small demonstration HTTP web server is available in the [examples](https://github.com/dalane/access-control/tree/master/examples/web) folder. It can be run in the
terminal using ```npm run example``` and accessed at ```http://localhost:8080```.

## Documentation

Detailed documentation can be found in the [readme](https://github.com/dalane/access-control/tree/master/readme/index.md) folder.

## Improvements

This library is under active development and will continue to evolve until version
1.0.0 is published. Any types, interface and functions may
change without any deprecation warnings.

A goal is to implement Obligations and Policy Information Points.

Suggestions, bug reports and pull requests to fix bugs or implement improvements
are welcome.
