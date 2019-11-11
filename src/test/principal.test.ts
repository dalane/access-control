import { assert } from 'chai';
import { compileUserIdPrincipal } from '../app/policy/principal';
import { EmptyAccessRequest } from './fixtures/test-data';
import { merge } from '../app/helpers';
import { IAccessRequest } from '../app/access-request';

describe('compiling a policy principal', () => {
  describe('#compileUserIdPrincipal returns a function that matches the policy principal to a request subject', () => {
    it('throws an error if there is no value for principal', () => {
      const itThrows = () => compileUserIdPrincipal(undefined);
      assert.throws(itThrows, 'The policy principal is missing');
    });
    it('throws an error if the value for principal is not a string', () => {
      const itThrows = () => compileUserIdPrincipal({});
      assert.throws(itThrows, 'The value of the policy principal must be a string');
    });
    it('returns ture for any user-id when the policy resource value is wildcard "*"', () => {
      const sut = compileUserIdPrincipal('*');
      assert.isFunction(sut, 'expected a function');
      assert.isTrue(sut(merge({}, EmptyAccessRequest, { subject: { 'user-id': 'test' }})).result, 'Expected a wildcard to return true for any user-id');
    });
    it('returns ture for when there is no user-id but the policy resource value is wildcard "*"', () => {
      const sut = compileUserIdPrincipal('*');
      assert.isFunction(sut, 'expected a function');
      const mockAccessRequest = <IAccessRequest><unknown>{};
      assert.isTrue(sut(mockAccessRequest).result, 'Expected a wildcard to return true for when there is no user-id or user-id path');
    });
    it('successfully compiles a principal when the value is a string', () => {
      const sut = compileUserIdPrincipal('test');
      assert.isFunction(sut, 'expected a function');
      assert.isTrue(sut(merge({}, EmptyAccessRequest, { subject: { 'user-id': 'test' }})).result, 'Expected a match for user-id "test"');
    });
    it('returns false result if the access request is missing the "user-id" property in the subject', () => {
      const sut = compileUserIdPrincipal('test');
      assert.isFunction(sut, 'expected a function');
      assert.isFalse(sut(merge({}, EmptyAccessRequest, { subject: { id: 'test' }})).result, 'Expected a false result as "user-id" is missing from the access request');
    });
  });
});