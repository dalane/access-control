'use strict';

const {expect} = require('chai');

const fortune = require('fortune');
// const {FortuneRepository} = require('../../build/repository/FortuneRepository');
const {Service, FortuneRepository} = require('../../build/index');
const {PolicyFactory} = require('../../build/policies/policy-factory');
const {RuleFactory} = require('../../build/policies/RuleFactory');
const {SpecificationFactory} = require('../../build/policies/specifications/specification-factory');
const {ResourceFactory} = require('../../build/policies/ResourceFactory');
const {PolicyDecisionPoint} = require('../../build/policy-decision-point');
const {PolicyEnforcementPoint} = require('../../build/policy-enforcement-point');
const {PolicyInformationPoint} = require('../../build/policy-information-point');
const {PolicyRetrievalPoint} = require('../../build/policy-retrieval-point');
const {AccessRequest} = require('../../build/access-request/access-request');
const {AccessResponse} = require('../../build/access-request/access-response');

const storeFactory = () => {
  const types = {
    policy: {
      name: {type: String},
      description: {type: String},
      effect: {type: String},
      action: {type: String},
      principal: {type: String},
      resource: {type: String},
      rule: {type: Object},
      obligations: {type: Object}
    }
  };
  return fortune(types);
};

describe('integration test', () => {
  it('is built with all dependencies without error', () => {
    let isError = false;
    const types = {
      policy: {
        name: {type: String},
        description: {type: String},
        effect: {type: String},
        action: {type: String},
        principal: {type: String},
        resource: {type: String},
        rule: {type: Object},
        obligations: {type: Object}
      }
    };
    // register types with the fortune store...
    const store = fortune(types);
    // build the dependencies 
    try {
      const repository = new FortuneRepository(store);
      const service = new Service(repository);
      expect(service.pep instanceof PolicyEnforcementPoint).to.equal(true, 'Expected policy enforcement point');
      expect(service.prp instanceof PolicyRetrievalPoint).to.equal(true, 'Expected policy retrieval point');
    } catch (error) {
      isError = true;
    }
    expect(isError).to.equal(false);
  });
  it('returns a deny decision as no policies have been created so there will be no policies relevant to the request found', async () => {
    let store = storeFactory();
    let repository = new FortuneRepository(store);
    let service = new Service(repository);
    await store.connect();
    await service.prp.refresh();
    let request = {
      user: {
        id: 'test-user',
        email: 'example@example.com',
        isAdmin: false
      },
      originalUrl: '/user/test-user/relationships',
      method: 'create',
      body: {}
    };
    // take the node http request and build a PDP authorization request message
    // at this point, the request has already been authenticated
    let message = {
      // set the subject parameters...
      subject: {
        id: request.user.id,
        email: request.user.email,
        isAdmin: request.user.isAdmin
      },
      // set the resource parameters...
      resource: {
        uri: request.originalUrl
      },
      // set the action parameters...
      action: {
        method: request.method
      },
      // set the environment parameters...
      environment: {}
    }
    let result = await service.pep.validateRequest(message);
    expect(result.decision).to.equal('Deny');
    expect(result.messages.length).to.equal(1);
    expect(result.messages[0]).to.equal('No valid access policies found that match the request.');
  });
  it('returns an allow decision as the user is an admin', async () => {
    let store = storeFactory();
    let repository = new FortuneRepository(store);
    let service = new Service(repository);
    await store.connect();
    let policy = {
      id: 'test-policy',
      name: 'AdminCreateUser',
      description: 'Only an admin can create users',
      effect: 'Allow',
      action: 'Create',
      resource: '/user/:id/relationships',
      rule: [
        {
          isTrue: {
            attribute: 'subject.isAdmin'
          }
        }
      ]
    };
    await store.request({
      method: 'create',
      type: 'policy',
      payload: [policy]
    });
    // refresh the policy retrieval point to ensure that the policies
    // are loaded...
    await service.prp.refresh();
    let request = {
      user: {
        id: 'test-user',
        email: 'example@example.com',
        isAdmin: true
      },
      originalUrl: '/user/test-user/relationships',
      method: 'create',
      body: {}
    };
    // take the node http request and build a PDP authorization request message
    // at this point, the request has already been authenticated
    let message = {
      // set the subject parameters...
      subject: {
        id: request.user.id,
        email: request.user.email,
        isAdmin: request.user.isAdmin
      },
      // set the resource parameters...
      resource: {
        uri: request.originalUrl
      },
      // set the action parameters...
      action: {
        method: request.method
      },
      // set the environment parameters...
      environment: {}
    }
    let result = await service.pep.validateRequest(message);
    expect(result.decision).to.equal('Allow');
  });
  it('returns a deny decision as the user is not an admin', async () => {
    let store = storeFactory();
    let repository = new FortuneRepository(store);
    let service = new Service(repository);
    await store.connect();
    let policy = {
      id: 'test-policy',
      name: 'AdminCreateUser',
      description: 'Only an admin can create users',
      effect: 'Allow',
      action: 'Create',
      resource: '/user/:id/relationships',
      rule: [
        {
          isTrue: {
            attribute: 'subject.isAdmin'
          }
        }
      ]
    };
    await store.request({
      method: 'create',
      type: 'policy',
      payload: [policy]
    })
    // refresh the policy retrieval point to ensure that the policies
    // are loaded...
    await service.prp.refresh();
    let request = {
      // set the subject parameters...
      subject: {
        id: 'test-user',
        email: 'example@example.com',
        isAdmin: false
      },
      // set the resource parameters...
      resource: {
        uri: '/user/test-user/relationships'
      },
      // set the action parameters...
      action: {
        method: 'create'
      },
      // set the environment parameters...
      environment: {}
    }
    let result = await service.pep.validateRequest(request);
    expect(result.decision).to.equal('Deny');
    expect(result.messages[0]).to.equal(policy.description);
  });
  it('returns an allow decision as the user is not an admin but they are updating their own record', async () => {
    let store = storeFactory();
    let repository = new FortuneRepository(store);
    let service = new Service(repository);
    await store.connect();
    let policy = {
      id: 'test-policy',
      name: 'AdminUpdateUser',
      description: 'Updating of user records can only be made by an admin or a user on their own record',
      effect: 'Allow',
      action: 'Update',
      resource: '/user/:id/relationships',
      rule: [
        {
          isTrue: {
            attribute: 'subject.isAdmin'
          }
        },
        {
          isEqual: {
            attribute: 'subject.id',
            expected: '${resource.params.id}'
          }
        }
      ]
    };
    // first let's add the policy to the store
    await store.request({
      method: 'create',
      type: 'policy',
      payload: [policy]
    });
    // refresh the policy retrieval point to ensure that the policies
    // are cached...
    await service.prp.refresh();
    let request = {
      // set the subject parameters...
      subject: {
        id: 'test-user',
        email: 'example@example.com',
        isAdmin: false
      },
      // set the resource parameters...
      resource: {
        uri: '/user/test-user/relationships'
      },
      // set the action parameters...
      action: {
        method: 'update'
      },
      // set the environment parameters...
      environment: {}
    }
    let result = await service.pep.validateRequest(request);
    expect(result.decision).to.equal('Allow');
  });
  it('returns a Deny decision as the user is not updating their own record', async () => {
    let store = storeFactory();
    let repository = new FortuneRepository(store);
    let service = new Service(repository);
    await store.connect();
    let policy = {
      id: 'test-policy',
      name: 'AdminUpdateUser',
      description: 'Updating of user records can only be made by a user on their own record',
      effect: 'Allow',
      action: 'Update',
      resource: '/user/:id/relationships',
      rule: [
        {
          isEqual: {
            attribute: 'subject.id',
            expected: '${resource.params.id}'
          }
        }
      ]
    };
    await store.request({
      method: 'create',
      type: 'policy',
      payload: [policy]
    });
    // refresh the policy retrieval point to ensure that the policies
    // are loaded...
    await service.prp.refresh();
    let request = {
      // set the subject parameters...
      subject: {
        id: 'test-user',
        email: 'example@example.com',
        isAdmin: false
      },
      // set the resource parameters...
      resource: {
        uri: '/user/not-test-user/relationships'
      },
      // set the action parameters...
      action: {
        method: 'update'
      },
      // set the environment parameters...
      environment: {}
    }
    let result = await service.pep.validateRequest(request);
    expect(result.decision).to.equal('Deny');
    expect(result.messages[0]).to.equal(policy.description);
  });
  it('returns an Allow decision for the the user identified as the principal as there is no rule and the effect is allow', async () => {
    let store = storeFactory();
    let repository = new FortuneRepository(store);
    let service = new Service(repository);
    await store.connect();
    let policy = {
      id: 'test-policy',
      name: 'AdminUpdateUser',
      description: 'Only user \'test-user\' is allowed to update user records',
      effect: 'Allow',
      action: 'Update',
      resource: '/user/:id',
      principal: 'test-user'
    };
    await store.request({
      method: 'create',
      type: 'policy',
      payload: [policy]
    });
    // refresh the policy retrieval point to ensure that the policies
    // are loaded...
    await service.prp.refresh();
    let request = {
      // set the subject parameters...
      subject: {
        id: 'test-user',
        email: 'example@example.com',
        isAdmin: false
      },
      // set the resource parameters...
      resource: {
        uri: '/user/not-test-user'
      },
      // set the action parameters...
      action: {
        method: 'update'
      },
      // set the environment parameters...
      environment: {}
    }
    let result = await service.pep.validateRequest(request);
    expect(result.decision).to.equal('Allow');
    // expect(result.messages[0]).to.equal(policy.description);
  });
  it('returns an Deny decision for the user identified as the principal as there is no rule and the effect is deny', async () => {
    let store = storeFactory();
    let repository = new FortuneRepository(store);
    let service = new Service(repository);
    await store.connect();
    let policy = {
      id: 'test-policy',
      name: 'AdminUpdateUser',
      description: 'The user \'test-user\' is not allowed to update user records',
      effect: 'Deny',
      action: 'Update',
      resource: '/user/:id/relationships',
      principal: 'test-user'
    };
    await store.request({
      method: 'create',
      type: 'policy',
      payload: [policy]
    });
    // refresh the policy retrieval point to ensure that the policies
    // are loaded...
    await service.prp.refresh();
    let request = {
      // set the subject parameters...
      subject: {
        id: 'test-user',
        email: 'example@example.com',
        isAdmin: false
      },
      // set the resource parameters...
      resource: {
        uri: '/user/not-test-user/relationships'
      },
      // set the action parameters...
      action: {
        method: 'update'
      },
      // set the environment parameters...
      environment: {}
    }
    let result = await service.pep.validateRequest(request);
    expect(result.decision).to.equal('Deny');
    expect(result.messages[0]).to.equal(policy.description);
  });
  it('returns a deny decision because the path was not found', async () => {
    let store = storeFactory();
    let repository = new FortuneRepository(store);
    let service = new Service(repository);
    await store.connect();
    let policy = {
      id: 'test-policy',
      name: 'AdminUpdateUser',
      description: 'The user \'test-user\' is not allowed to update user records',
      effect: 'Deny',
      action: 'Update',
      resource: '/user/:id',
      principal: 'test-user'
    };
    await store.request({
      method: 'create',
      type: 'policy',
      payload: [policy]
    });
    // refresh the policy retrieval point to ensure that the policies
    // are loaded...
    await service.prp.refresh();
    let request = {
      // set the subject parameters...
      subject: {
        id: 'test-user',
        email: 'example@example.com',
        isAdmin: false
      },
      // set the resource parameters...
      resource: {
        uri: '/projects/project-id'
      },
      // set the action parameters...
      action: {
        method: 'update'
      },
      // set the environment parameters...
      environment: {}
    }
    let result = await service.pep.validateRequest(request);
    expect(result.decision).to.equal('Deny');
    expect(result.messages[0]).to.equal('No valid access policies found that match the request.');
  });
});





