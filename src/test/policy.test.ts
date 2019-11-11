import { assert } from 'chai';
import { compilePolicy, IPolicy } from '../app/policy/policy';
import { IAccessRequest } from '../app/access-request';
import { IPrincipalMatchResult, IPrincipalMatchFunc, ICompilePrincipal } from '../app/policy/principal';
import { ICompileAction, IActionMatchFunc, IActionMatchResult } from '../app/policy/action';
import { ICompilePolicyResourceFunc, IResourceMatchFunc, IResourceMatchResult } from '../app/policy/resource';
import { ICompileSpecification, ISpecificationMatchFunc } from '../app/policy/specification';
import { DefaultPolicy } from './fixtures/test-data';
import { merge } from '../app/helpers';

describe('compiling a policy', () => {
  // these functions allow us to inject a mock result that is returned to the calling
  // function..
  const _compilePrincipal = (result?:IPrincipalMatchResult):ICompilePrincipal => (value:any):IPrincipalMatchFunc => (accessRequest:IAccessRequest):IPrincipalMatchResult => result;
  const _compileAction = (result?:IActionMatchResult):ICompileAction => (value:any):IActionMatchFunc => (accessRequest:IAccessRequest):IActionMatchResult => result;
  const _compileResource = (result?:IResourceMatchResult):ICompilePolicyResourceFunc=> (value:any):IResourceMatchFunc => (accessRequest:IAccessRequest):IResourceMatchResult => result;
  const _compileSpecification = (result?:boolean):ICompileSpecification=> (value:any):ISpecificationMatchFunc => (accessRequest:IAccessRequest):boolean => result;
  it('throws an error if policy is undefined', () => {
    const mockCompilePrincipal = _compilePrincipal();
    const mockCompileAction = _compileAction();
    const mockCompileResource = _compileResource();
    const mockCompileSpecification = _compileSpecification();
    const itThrows = () => compilePolicy(mockCompileAction)(mockCompileResource)(mockCompilePrincipal)(mockCompileSpecification)(undefined);
    assert.throws(itThrows, 'The policy is undefined');
  });
  it('throws an error if policy is not an object', () => {
    const mockCompilePrincipal = _compilePrincipal();
    const mockCompileAction = _compileAction();
    const mockCompileResource = _compileResource();
    const mockCompileSpecification = _compileSpecification();
    const itThrows = () => compilePolicy(mockCompileAction)(mockCompileResource)(mockCompilePrincipal)(mockCompileSpecification)(<IPolicy><unknown>'policy');
    assert.throws(itThrows, 'The policy is not an object');
  });
  it('throws an error if policy version is not equal to 1', () => {
    const mockCompilePrincipal = _compilePrincipal();
    const mockCompileAction = _compileAction();
    const mockCompileResource = _compileResource();
    const mockCompileSpecification = _compileSpecification();
    const itThrows = () => compilePolicy(mockCompileAction)(mockCompileResource)(mockCompilePrincipal)(mockCompileSpecification)(merge({}, DefaultPolicy, { version: 2 }));
    assert.throws(itThrows, 'Only version 1 policies are supported');
  });
  it('it returns a compiled policy object that returns expected results', () => {
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
    const mockAccessRequest = <IAccessRequest><unknown>{};
    const sut = compilePolicy(mockCompileAction)(mockCompileResource)(mockCompilePrincipal)(mockCompileSpecification)(DefaultPolicy);
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