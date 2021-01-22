import { assert } from 'chai';
import { DefaultAllowPrincipalPolicy, DefaultAllowResourcePolicy } from './fixtures/test-data';
import { isSatisfiedByTrueFn, merge } from '../app/helpers';
import { CreateIsSatisfiedParseFn, makePolicySchemeValueParser } from '../app/policy/parser';
import { IAccessRequest } from '../app/access-request';
import { IIsPolicyMatchFn, IIsSatisfiedByResult, IPolicy, makeCompilePolicy } from '../app/policy';
import { CompileSpecificationsFn, SpecificationMatchFn } from '../app/policy/specification';

describe('#makeParsePolicyPrincipalValue returns a function that matches the principal of a policy to an access request', () => {
  it('returns an IIsSatisfiedByFn that returns false if the policy does not contain a principal', () => {
    const sut = makePolicySchemeValueParser([]);
    const result = sut(undefined)(<IAccessRequest>{});
    assert.equal(result.result, false, 'Expected the access request to return a false result');
  });
  it('returns an IIsSatisfiedByFn that returns true if the policy contains a wild card for principal', () => {
    const sut = makePolicySchemeValueParser([]);
    const result = sut('*')(<IAccessRequest>{});
    assert.equal(result.result, true, 'Expected the access request to return a true result');
  });
  it('returns an IIsSatisfiedByFn that returns true if the policy contains an array for principal', () => {
    const sut = makePolicySchemeValueParser([]);
    const result = sut(['*'])(<IAccessRequest>{});
    assert.equal(result.result, true, 'Expected the access request to return a true result');
  });
  it('it throws an exception if a matching principal policy parser is not found', () => {
    const itThrows = () => makePolicySchemeValueParser([
      {
        scheme: 'userid',
        matchFn: (value: string) => isSatisfiedByTrueFn
      },
    ])('clientid:test');
    assert.throws(itThrows, 'Unable to match a scheme assertion matcher for scheme "clientid"');
  });
  it('it returns an IIsSatisfiedByFn if a matching principal policy parser is found', () => {
    const sut = makePolicySchemeValueParser([
      {
        scheme: 'test',
        matchFn: (value: string) => isSatisfiedByTrueFn
      },
    ])('test:test');
    assert.isFunction(sut, 'Expected a function');
    assert.isTrue(sut(<IAccessRequest><unknown>{}).result, 'Expected a true result');
  });
  it('returns an IIsSatisfiedByFn that returns true if the policy contains an array for principal with matching parser', () => {
    const sut = makePolicySchemeValueParser([]);
    const result = sut(['*'])(<IAccessRequest>{});
    assert.isFunction(sut, 'Expected a function');
    assert.equal(result.result, true, 'Expected the access request to return a true result');
  });
});

describe('compiling a policy', () => {
  // these functions allow us to inject a mock result that is returned to the calling
  // function..
  const _compilePrincipal = (result?:IIsSatisfiedByResult): CreateIsSatisfiedParseFn => (value:any):IIsPolicyMatchFn => (accessRequest:IAccessRequest):IIsSatisfiedByResult => result;
  const _compileAction = (result?:IIsSatisfiedByResult): CreateIsSatisfiedParseFn => (value:any):IIsPolicyMatchFn => (accessRequest:IAccessRequest):IIsSatisfiedByResult => result;
  const _compileResource = (result?:IIsSatisfiedByResult): CreateIsSatisfiedParseFn => (value:any):IIsPolicyMatchFn => (accessRequest:IAccessRequest):IIsSatisfiedByResult => result;
  const _compileSpecification = (result?:boolean):CompileSpecificationsFn => (value:any):SpecificationMatchFn => (accessRequest:IAccessRequest):boolean => result;
  it('throws an error if policy is undefined', () => {
    const mockCompilePrincipal = _compilePrincipal();
    const mockCompileAction = _compileAction();
    const mockCompileResource = _compileResource();
    const mockCompileSpecification = _compileSpecification();
    const itThrows = () => makeCompilePolicy(mockCompileAction, mockCompileResource, mockCompilePrincipal, mockCompileSpecification)(undefined);
    assert.throws(itThrows, 'The policy is undefined');
  });
  it('throws an error if policy is not an object', () => {
    const mockCompilePrincipal = _compilePrincipal();
    const mockCompileAction = _compileAction();
    const mockCompileResource = _compileResource();
    const mockCompileSpecification = _compileSpecification();
    // const itThrows = () => compilePolicy(mockCompileAction, mockCompileResource, mockCompilePrincipal, mockCompileSpecification)(<IPolicy><unknown>'policy');
    const itThrows = () => makeCompilePolicy(mockCompileAction, mockCompileResource, mockCompilePrincipal, mockCompileSpecification)('policy' as unknown as IPolicy);
    assert.throws(itThrows, 'The policy is not an object');
  });
  it('throws an error if policy version is not equal to 1', () => {
    const mockCompilePrincipal = _compilePrincipal();
    const mockCompileAction = _compileAction();
    const mockCompileResource = _compileResource();
    const mockCompileSpecification = _compileSpecification();
    const itThrows = () => makeCompilePolicy(mockCompileAction, mockCompileResource, mockCompilePrincipal, mockCompileSpecification)(merge({}, DefaultAllowPrincipalPolicy, { version: 2 }));
    assert.throws(itThrows, 'Only version 1 policies are supported');
  });
  it('it returns a compiled principal policy object that returns expected results', () => {
    // any params found during a resource, principal or action match are merged into
    // the access request...
    const mockCompilePrincipal = _compilePrincipal({
      result: true,
      params: {
        source: 'principal'
      }
    });
    const mockCompileAction = _compileAction({
      result: true,
      params: {
        source: 'action'
      }
    });
    const mockCompileResource = _compileResource({
      result: true,
      params: {
        source: 'resource'
      }
    });
    const mockCompileSpecification = _compileSpecification(true);
    // we can pass an empty access request because the mocks don't do anything with it as these are tested individually...
    const mockAccessRequest = {} as unknown as IAccessRequest;
    const sut = makeCompilePolicy(mockCompileAction, mockCompileResource, mockCompilePrincipal, mockCompileSpecification)(DefaultAllowPrincipalPolicy);
    assert.isObject(sut, 'Expected that the compiled policy would be an object');
    assert.isFunction(sut.isPrincipalSatisfied, 'expected the principal to be a function');
    assert.equal(sut.isPrincipalSatisfied(mockAccessRequest).params.source, 'principal', 'expected the source in params to match the source found during a policy match');
    assert.isFunction(sut.isActionSatisfied, 'expected the action to be a function');
    assert.equal(sut.isActionSatisfied(mockAccessRequest).params.source, 'action');
    assert.isFunction(sut.isResourceSatisfied, 'expected the resource to be a function');
    assert.equal(sut.isResourceSatisfied(mockAccessRequest).params.source, 'resource');
    assert.isFunction(sut.isSpecificationSatisfied, 'expected the specification to be a function');
    assert.isTrue(sut.isSpecificationSatisfied(mockAccessRequest), 'expected the specification to return true');
  });
  it('it returns a compiled resource policy object that returns expected results', () => {
    // any params found during a resource, principal or action match are merged into
    // the access request...
    const mockCompilePrincipal = _compilePrincipal({
      result: true,
      params: {
        source: 'principal'
      }
    });
    const mockCompileAction = _compileAction({
      result: true,
      params: {
        source: 'action'
      }
    });
    const mockCompileResource = _compileResource({
      result: true,
      params: {
        source: 'resource'
      }
    });
    const mockCompileSpecification = _compileSpecification(true);
    // we can pass an empty access request because the mocks don't do anything with it as these are tested individually...
    const mockAccessRequest = {} as unknown as IAccessRequest;
    const sut = makeCompilePolicy(mockCompileAction, mockCompileResource, mockCompilePrincipal, mockCompileSpecification)(DefaultAllowResourcePolicy);
    assert.isObject(sut, 'Expected that the compiled policy would be an object');
    assert.isFunction(sut.isPrincipalSatisfied, 'expected the principal to be a function');
    assert.equal(sut.isPrincipalSatisfied(mockAccessRequest).params.source, 'principal', 'expected the source in params to match the source found during a policy match');
    assert.isFunction(sut.isActionSatisfied, 'expected the action to be a function');
    assert.equal(sut.isActionSatisfied(mockAccessRequest).params.source, 'action');
    assert.isFunction(sut.isResourceSatisfied, 'expected the resource to be a function');
    assert.equal(sut.isResourceSatisfied(mockAccessRequest).params.source, 'resource');
    assert.isFunction(sut.isSpecificationSatisfied, 'expected the specification to be a function');
    assert.isTrue(sut.isSpecificationSatisfied(mockAccessRequest), 'expected the specification to return true');
  });
});
