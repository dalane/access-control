import { assert } from 'chai';
import { compileCommandQueryAction, compileHttpAction } from '../app/policy/action';
import { EmptyAccessRequest } from './fixtures/test-data';
import { merge } from '../app/helpers';
import { IAccessRequest } from '../app/access-request';

describe('Compiling a policy action', () => {
  describe('#compileCommandQueryAction returns a function that matches the policy action to a request action using coomand/query names', () => {
    it('throws an error if not in the format <action-type>:<action-name>', () => {
      const itThrowsAnError = () => compileCommandQueryAction('test:test:test');
      assert.throws(itThrowsAnError, 'The value for the action should be "query:<name-of-query>" or "command:<name-of-command>"');
    });
    it('throws an error if the action type is not "query" or "command"', () => {
      const itThrowsAnError = () => compileCommandQueryAction('test:test');
      assert.throws(itThrowsAnError, 'The value for the action should be "query:<name-of-query>" or "command:<name-of-command>"');
    });
    it('successfully compiles a wildcard action', () => {
      const sut = compileCommandQueryAction('*');
      assert.isFunction(sut, 'Expected #compileCommandQueryAction to return a function for a wildcard action');
      assert.isTrue(sut(merge({}, EmptyAccessRequest, { action: { name: 'command:command' } })).result, 'Expected the compiled action to return true for any value of action in the access request');
    });
    it('successfully compiles a wildcard command', () => {
      const sut = compileCommandQueryAction('command:*');
      assert.isFunction(sut, 'Expected #compileCommandQueryAction to return a function for a wildcard command action');
      assert.isTrue(sut(merge({}, EmptyAccessRequest, { action: { name: 'command:command' }})).result, 'Expected the compiled action to return true for any value of action in the access request that is a command');
      assert.isFalse(sut(merge({}, EmptyAccessRequest, { action: { name: 'query:command' }})).result, 'Expected the compiled action to return false for any value of action in the access request that is a query');
      assert.isFalse(sut(merge({}, EmptyAccessRequest, { action: { name: 'test:command:test' }})).result, 'Expected the compiled action to return false for any value of action in the access request that is not in the format <type>:<name>');
    });
    it('successfully compiles a wildcard query', () => {
      const sut = compileCommandQueryAction('query:*');
      assert.isFunction(sut, 'Expected #compileCommandQueryAction to return a function for a wildcard query action');
      assert.isTrue(sut(merge({}, EmptyAccessRequest, { action: { name: 'query:test' }})).result, 'Expected the compiled action to return true for any value of action in the access request that is a query');
      assert.isFalse(sut(merge({}, EmptyAccessRequest, { action: { name: 'command:test' }})).result, 'Expected the compiled action to return false for any value of action in the access request that is a command');
    });
    it('successfully compiles a named query', () => {
      const sut = compileCommandQueryAction('query:test');
      assert.isFunction(sut, 'Expected #compileCommandQueryAction to return a function for a named query action');
      assert.isTrue(sut(merge({}, EmptyAccessRequest, { action: { name: 'query:test' }})).result, 'Expected the compiled action to return true for any value of action in the access request that is a query');
      assert.isFalse(sut(merge({}, EmptyAccessRequest, { action: { name: 'query:not-test' }})).result, 'Expected the compiled action to return false for a query name that doesn\'t match');
    });
    it('successfully compiles a named command', () => {
      const sut = compileCommandQueryAction('command:test');
      assert.isFunction(sut, 'Expected #compileCommandQueryAction to return a function for a named command action');
      assert.isTrue(sut(merge({}, EmptyAccessRequest, { action: { name: 'command:test' }})).result, 'Expected the compiled action to return true for any value of action in the access request that is a query');
      assert.isFalse(sut(merge({}, EmptyAccessRequest, { action: { name: 'command:not-test' }})).result, 'Expected the compiled action to return false for a command name that doesn\'t match');
    });
  });
  describe('#compileHttpAction returns a function that matches the policy action to a request action using http verbs', () => {
    it('throws an error if the value is not a string', () => {
      const itThrows = () => compileHttpAction({});
      assert.throws(itThrows, 'The value for the policy action must be a string HTTP verb');
    });
    it('throws an error if the action is not a HTTP verb', () => {
      const itThrows = () => compileHttpAction('CATCH');
      assert.throws(itThrows, 'The value for action should be "GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS", or "*"');
    });
    it('returns false if the access request is missing .action.method property', () => {
      const mockAccessRequest = {} as unknown as IAccessRequest;
      const sut = compileHttpAction('GET')(mockAccessRequest);
      assert.hasAnyKeys(sut, ['result'], 'Expected the result to be an object with a key "result"');
      assert.isFalse(sut.result, 'Expected the ey "result" to have the value false');
    });
    it('returns true for any access request where the resource is a wildcard', () => {
      const sut = compileHttpAction('*');
      const mockAccessRequest = {} as unknown as IAccessRequest;
      assert.isTrue(sut(mockAccessRequest).result, 'Expected a wild card to return true for any access request');
    });
  });
});