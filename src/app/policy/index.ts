import { IAccessRequest } from "../access-request";
import { assert, assertIsDefined, assertIsObject, } from '../helpers';
import { ICompileSpecificationsFn, ISpecificationMatchFn, ISpecification, } from "./specification";
import { CreateIsSatisfiedParseFn, } from "./parser";
import { getPolicyEffect, POLICY_EFFECT } from "./effect";


export interface IIsSatisfiedByResult {
	result:boolean;
	params?:{
		[key:string]:any;
	};
	message?:string;
}

export type IIsPolicyMatchFn = (accessRequest:IAccessRequest) => IIsSatisfiedByResult;

export const makeIsSatisfiedByResult = (result:boolean, params?:object, message?:string):IIsSatisfiedByResult => ({
	result,
	...{ params },
	...{ message }
});

 /*
 * Compile policy
 */

export interface IPolicy {
	version: number;
	path?: string;
	extends?: string;
	id?: string;
	name?: string;
	description?: string;
	effect: POLICY_EFFECT;
	principal?: string | string[];
	action: string | string[];
	resource?: string | string[];
	specification: ISpecification | ISpecification[];
	// TODO: add obligations
}

export interface ICompiledPolicy {
	version:number;
	extends?:string;
	id?:string;
	path?:string;
	name?:string;
	description?:string;
	effect:POLICY_EFFECT;
	isPrincipalSatisfied:IIsPolicyMatchFn;
	isActionSatisfied:IIsPolicyMatchFn;
	isResourceSatisfied:IIsPolicyMatchFn;
	isSpecificationSatisfied:ISpecificationMatchFn;
	principal:any;
	action:any;
	resource:any;
	specification:ISpecification|ISpecification[];
	// TODO: add obligations
}

export type ICompilePolicy = (
	compileAction: CreateIsSatisfiedParseFn,
	compileResource: CreateIsSatisfiedParseFn,
	compilePrincipal: CreateIsSatisfiedParseFn,
	compileSpecification: ICompileSpecificationsFn
) => (policy: IPolicy) => ICompiledPolicy;

export const makeCompilePolicy: ICompilePolicy = (
	compileActionFn: CreateIsSatisfiedParseFn,
	compileResourceFn: CreateIsSatisfiedParseFn,
	compilePrincipalFn: CreateIsSatisfiedParseFn,
	compileSpecificationFn: ICompileSpecificationsFn
	) => (policy: IPolicy): ICompiledPolicy => {
		assertIsDefined(policy, 'The policy is undefined');
		assertIsObject(policy, 'The policy is not an object');
		assertIsDefined(policy.version, 'You must specify a policy version');
		assert(policy.version === 1, 'Only version 1 policies are supported');
		assertIsDefined(policy?.effect, 'You must specify a policy effect');
		return {
			version: policy.version,
			extends: policy.extends,
			path: policy.path,
			id: policy.id,
			name: policy.name,
			description: policy?.description,
			effect: getPolicyEffect(policy),
			isPrincipalSatisfied: compilePrincipalFn(policy.principal),
			isActionSatisfied: compileActionFn(policy.action),
			isResourceSatisfied: compileResourceFn(policy.resource),
			isSpecificationSatisfied: compileSpecificationFn(policy.specification),
			// TODO: obligations in version 2 policy
			principal: policy.principal,
			action: policy.action,
			resource: policy.resource,
			specification: { ...policy.specification },
		};
};
