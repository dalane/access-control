'use strict';

const {Policy} = require('../../../build/policies/policy');
const {PolicyFactory} = require('../../../build/policies/policy-factory');
const {AccessRequestMock, RuleMock, ResourceMock, SpecificationMock} = require('../../helpers');
const {expect} = require('chai');
const {fromJS, Map} = require('immutable');

describe('Policies', () => {
  describe('Policy class', () => {
    describe('#constructor', () => {
      xit('if id is null or undefined it throws an error');
      xit('if name is null or undefined it throws an error');
      xit('if effect is null or undefined it throws an error');
      xit('if action is null or undefined it throws an error');
      xit('principal, rule and resource are null or undefined it throws an error');
      it('#constructor action is restricted to a list otherwise throws error if action is not permitted', () => {
        let testActions = [
          'create',
          'find',
          'update',
          'delete',
          '*',
          'not-an-action' // throws an error
        ];
        testActions.forEach(action => {
          let thrownError = null;
          try {
            let sut = new Policy('id', 'name', 'description', 'Allow', action);
          } catch (error) {
            thrownError = error;
          }
          if (action === 'not-an-action') {
            expect(thrownError instanceof Error).to.equal(true);
          } else {
            expect(thrownError).to.equal(null, action);
          }
        })
      });
      it('#constructor effect is restricted to a list otherwise throws error if effect is not permitted', () => {
        let testEffects = [
          'Allow',
          'Deny',
          'not-an-effect' // throws an error
        ];
        testEffects.forEach(effect => {
          let thrownError = null;
          try {
            let sut = new Policy('id', 'name', 'description', effect, 'Create');
          } catch (error) {
            thrownError = error;
          }
          if (effect === 'not-an-effect') {
            expect(thrownError instanceof Error).to.equal(true);
          } else {
            expect(thrownError).to.equal(null, effect);
          }
        })
      });
    });
    it('Updates the access request with path params before passing to the rule', () => {
      let state = {
        accessRequestGetInCalled: false,

      }
      let accessRequest = new AccessRequestMock();
      let resource = new ResourceMock();
      let rule = new RuleMock();
      let sut = new Policy('id', 'name', 'description', 'Allow', 'Create', null, resource, rule);
      // isSatisfiedBy:
      // - extracts the uri from the request accessRequest#getIn
      accessRequest.getInCb = (data) => {
        expect(Array.isArray(data)).to.equal(true, 'accessRequest#getIn is array');
        expect(data.length).to.equal(2, 'accessRequest#getIn has two items');
        expect(data[0]).to.equal('resource', 'accessRequest#getIn first item is "resource"');
        expect(data[1]).to.equal('uri', 'accessRequest#getIn second item is "uri"');
        return '/path/to/resource'
      };
      // - calls match on the resource to extract any params from the uri resource#match
      resource.matchCb = (data) => {
        expect(data).to.equal('/path/to/resource', 'resource#match');
        return {
          matched: 'param'
        }
      };
      // - merges those changes into a new access request accessRequest#merge
      accessRequest.mergeCb = (data) => {
        expect(data instanceof Map).to.equal(true);
        expect(data.getIn('resource.params.matched'.split('.'))).to.equal('param', 'accessRequest#merge');
        return data;
      };
      // - calls isSatisfiedBy on the rule with the new merged access request rule#isSatisfiedBy
      rule.isSatisfiedByCb = (data) => {
        expect(data.getIn('resource.params.matched'.split('.'))).to.equal('param', 'rule#isSatisfiedBy');
        return true;
      }
      expect(sut.isSatisfiedBy(accessRequest)).to.equal(true);
    });
    it('returns the correct value for all getters set in the constructor', () => {
      let id = 'id';
      let name = 'name';
      let description = 'description';
      let effect = 'Allow';
      let action = 'Create';
      let principal = 'principal';
      let resource = new ResourceMock();
      let rule = new RuleMock();
      let obligations = [];
      let sut = new Policy(id, name, description, effect, action, principal, resource, rule, obligations);
      expect(sut.id).to.equal(id);
      expect(sut.name).to.equal(name);
      expect(sut.description).to.equal(description);
      expect(sut.effect).to.equal(effect);
      expect(sut.action).to.equal(action);
      expect(sut.principal).to.equal(principal);
      expect(sut.resource === resource).to.equal(true);
      expect(sut.rule === rule).to.equal(true);
      expect(sut.obligations === obligations).to.equal(true);
    });
  });
  describe('Policy factory', () => {
    it('returns a policy from a POJO', () => {
      let ruleFactory = {
        create: (object) => {
          let rule = new RuleMock();
          rule.isSatisfiedByCb = (accessRequest) => {
            return true;
          };
          return rule;
        }
      };
      let resourceFactory = {
        create: (uri) => {
          let resource = new ResourceMock(uri);
          resource.matchCb = (uri) => {
            return {};
          };
          return resource;
        }
      };
      let obligationExpressionFactory = {
        create: (pojo) => {
          return [];
        }
      };
      let sut = new PolicyFactory(ruleFactory, resourceFactory, obligationExpressionFactory);
      let plainObjectPolicy = {
        id: '1234',
        name: 'test policy',
        effect: 'Allow',
        action: 'Create',
        resource: '/path/to/resource'
      };
      let policy = sut.create(plainObjectPolicy);
      expect(policy instanceof Policy).to.equal(true);
    });
  });
});
