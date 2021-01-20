import { merge } from '../app/helpers';
import { matchUrlPatternResourceFn } from '../app/policy/resource';
import { assert } from 'chai';
import { EmptyAccessRequest } from './fixtures/test-data';

describe('compiling a resource', () => {
  describe('#compileUrlPatternResource returns a function that matches the policy principal to a request subject', () => {
    it('throws an error if the value for the resource is not a string', () => {
      const itThrows = () => matchUrlPatternResourceFn(<any>{});
      assert.throws(itThrows, 'The value for the resource must be a string');
    });
    it('throws an error if the value for the resource is an empty string', () => {
      const itThrows = () => matchUrlPatternResourceFn('');
      assert.throws(itThrows, 'The value for the resource is an empty string');
    });
    it('throws an error if the schema for the resource value is undefined', () => {
      const itThrows = () => matchUrlPatternResourceFn(undefined);
      assert.throws(itThrows, 'A value for the resource selector is required.');
    });
    it('it compiles a wildcard successfully and returns the expected result when passed an access request', () => {
      const sut = matchUrlPatternResourceFn('*');
      const mockAccessRequest = merge({}, EmptyAccessRequest, { resource: { path: '/path/1234' }});
      const successResult = sut(mockAccessRequest);
      assert.isTrue(successResult.result, 'Expected result to be true for matched path');
      assert.isUndefined(successResult.params, 'Expected there to be no params to returned');
    });
    it('it compiles a root path pattern successfully and returns the expected result when passed an access request', () => {
      const sut = matchUrlPatternResourceFn('/');
      const successResult = sut(merge({}, EmptyAccessRequest, { resource: { path: '/' }}));
      assert.isTrue(successResult.result, 'Expected result to be true for matched path');
    });
    it('it compiles a pattern successfully and returns the expected result when passed an access request', () => {
      const sut = matchUrlPatternResourceFn('/path/:id');
      const successResult = sut(merge({}, EmptyAccessRequest, { resource: { path: '/path/1234' }}));
      assert.isTrue(successResult.result, 'Expected result to be true for matched path');
      assert.equal(successResult.params.id, 1234, 'Expected id param from path to be returned');
    });
  });
});
