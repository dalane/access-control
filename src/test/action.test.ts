import { assert } from 'chai';
import { matchHttpActionFn } from '../app/policy/action';
import { IAccessRequest } from '../app/access-request';

describe('Compiling a policy action', () => {
  describe('#compileHttpAction returns a function that matches the policy action to a request action using http verbs', () => {
    it('throws an error if the value is not a string', () => {
      const itThrows = () => matchHttpActionFn(<any>{});
      assert.throws(itThrows, 'The value for the action must be a string');
    });
    it('throws an error if the action is not a HTTP verb', () => {
      const itThrows = () => matchHttpActionFn('CATCH');
      assert.throws(itThrows, 'The value for action should be "GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS", or "*"');
    });
    it('returns false if the access request is missing .action.method property', () => {
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const sut = matchHttpActionFn('GET')(mockAccessRequest);
      assert.hasAnyKeys(sut, ['result'], 'Expected the result to be an object with a key "result"');
      assert.isFalse(sut.result, 'Expected the "result" to have the value false');
    });
    it('returns true for any access request where the resource is a wildcard', () => {
      const sut = matchHttpActionFn('*');
      const mockAccessRequest = {} as unknown as IAccessRequest;
      assert.isTrue(sut(mockAccessRequest).result, 'Expected a wild card to return true for any access request');
    });
    it('returns true for an access request where the method is a match to the policy', () => {
      const sut = matchHttpActionFn('POST');
      const mockAccessRequest = { action: { method: 'POST' } } as unknown as IAccessRequest;
      assert.isTrue(sut(mockAccessRequest).result, 'Expected a POST action on access request to return true as policy is POST');
    });
    it('returns false for an access request where the method is not a match to the policy', () => {
      const sut = matchHttpActionFn('POST');
      const mockAccessRequest = { action: { method: 'GET' } } as unknown as IAccessRequest;
      assert.isFalse(sut(mockAccessRequest).result, 'Expected a POST action on access request to return false as policy is POST');
    });
  });
});
