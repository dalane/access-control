import { assert } from 'chai';
import { compileUrlPatternResource } from '../app/policy/resource';
import { EmptyAccessRequest } from './fixtures/test-data';
import { merge } from '../app/helpers';

describe('compiling a resouce', () => {
  describe('#compileUrlPatternResource returns a function that matches the policy principal to a request subject', () => {
    it('throws an error if the value for the resource is missing', () => {
      const itThrows = () => compileUrlPatternResource(undefined);
      assert.throws(itThrows, 'The value for the resource is missing');
    });
    it('throws an error if the value for the resource is not a string', () => {
      const itThrows = () => compileUrlPatternResource({});
      assert.throws(itThrows, 'The value for the resource must be a string');
    });
    it('throws an error if the value for the resource is an empty string', () => {
      const itThrows = () => compileUrlPatternResource('');
      assert.throws(itThrows, 'The value for the resource is an empty string');
    });
    it('it compiles a wildcard successfully and returns the expected result when passed an access request', () => {
      const sut = compileUrlPatternResource('*');
      const mockAccessRequest = merge({}, EmptyAccessRequest, { resource: { path: '/path/1234' }});
      const successResult = sut(mockAccessRequest);
      assert.isTrue(successResult.result, 'Expected result to be true for matched path');
      assert.equal(Object.getOwnPropertyNames(successResult.params).length, 0, 'Expected there to be no params to returned');
    });
    it('it compiles a root path pattern successfully and returns the expected result when passed an access request', () => {
      const sut = compileUrlPatternResource('/');
      const successResult = sut(merge({}, EmptyAccessRequest, { resource: { path: '/' }}));
      assert.isTrue(successResult.result, 'Expected result to be true for matched path');
    });
    it('it compiles a pattern successfully and returns the expected result when passed an access request', () => {
      const sut = compileUrlPatternResource('/path/:id');
      const successResult = sut(merge({}, EmptyAccessRequest, { resource: { path: '/path/1234' }}));
      assert.isTrue(successResult.result, 'Expected result to be true for matched path');
      assert.equal(successResult.params.id, 1234, 'Expected id param from path to be returned');
    });
  });
});