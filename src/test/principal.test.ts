import { assert } from 'chai';
import { EmptyAccessRequest } from './fixtures/test-data';
import { merge } from '../app/helpers';
import { matchUserIdPrincipalFn } from '../app/policy/principal';
import { IAccessRequest } from '../app/access-request';

describe('compiling a policy principal', () => {
  describe('#compileUserIdPrincipal returns a function that matches the policy principal to a request subject', () => {
    it('throws an error if the value for principal is not a string', () => {
      const itThrows = () => matchUserIdPrincipalFn(<any>{});
      assert.throws(itThrows, 'The value for the principal must be a string');
    });
    it('throws an error when the policy resource value is undefined', () => {
      const itThrows = () => matchUserIdPrincipalFn(undefined);
      assert.throws(itThrows, 'A value for the principal policy is required.');
    });
    it('returns true for any user-id when the policy resource value is wildcard "*"', () => {
      const sut = matchUserIdPrincipalFn('*');
      assert.isFunction(sut, 'expected a function');
      assert.isTrue(sut(merge({}, EmptyAccessRequest, { subject: { userid: 'test' }})).result, 'Expected a wildcard to return true for any userid');
    });
    it('returns true for when there is no user-id but the policy resource value is wildcard "*"', () => {
      const sut = matchUserIdPrincipalFn('*');
      assert.isFunction(sut, 'expected a function');
      const mockAccessRequest = {} as unknown as IAccessRequest;
      assert.isTrue(sut(mockAccessRequest).result, 'Expected a wildcard to return true for when there is no user-id or user-id path');
    });
    it('successfully compiles a principal when the value is a string', () => {
      const sut = matchUserIdPrincipalFn('test');
      assert.isFunction(sut, 'expected a function');
      assert.isTrue(sut(merge({}, EmptyAccessRequest, { subject: { userid: 'test' }})).result, 'Expected a match for user-id "test"');
    });
    it('returns false result if the access request is missing the "user-id" property in the subject', () => {
      const sut = matchUserIdPrincipalFn('test');
      assert.isFunction(sut, 'expected a function');
      assert.isFalse(sut(merge({}, EmptyAccessRequest, { subject: { id: 'test' }})).result, 'Expected a false result as "user-id" is missing from the access request');
    });
  });
});
