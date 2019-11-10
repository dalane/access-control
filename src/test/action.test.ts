import { assert } from 'chai';
import { compileCommandQueryAction, compileHttpAction } from '@app/policy/action';
import { EmptyAccessRequest } from '@tests/fixtures/test-data';
import { merge } from '@app/helpers';

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
    it.skip('throws an error if the value is not a string');
    it.skip('throws an error if the action is not a HTTP verb');
    it.skip('throws an error if the access request is missing .action.method property');

  });
});