import {PolicyEnforcementPoint} from './policy-enforcement-point';
import {PolicyRetrievalPoint} from './policy-retrieval-point';
import {RepositoryInterface} from './repository/RepositoryInterface';
import {FortuneRepository} from './repository/FortuneRepository';
import {MemoryRepository} from './repository/MemoryRepository';
import {PolicyFactory} from './policies/policy-factory';
import {RuleFactory} from './policies/RuleFactory';
import {SpecificationFactory} from './policies/specifications/specification-factory';
import {ResourceFactory} from './policies/ResourceFactory';
import {PolicyDecisionPoint} from './policy-decision-point';
import {PolicyInformationPoint} from './policy-information-point';

class Service {
  private _policyEnforcementPoint: PolicyEnforcementPoint;
  private _policyRetrievalPoint: PolicyRetrievalPoint;
  private _policyInformationPoint: PolicyInformationPoint;
  constructor(repository: RepositoryInterface) {
    const specificationFactory = new SpecificationFactory();
    const resourceFactory = new ResourceFactory();
    const ruleFactory = new RuleFactory(specificationFactory);
    const policyFactory = new PolicyFactory(ruleFactory, resourceFactory);
    this._policyRetrievalPoint = new PolicyRetrievalPoint(repository, policyFactory);
    this._policyInformationPoint = new PolicyInformationPoint();
    const pdp = new PolicyDecisionPoint(this._policyRetrievalPoint, this._policyInformationPoint);
    this._policyEnforcementPoint = new PolicyEnforcementPoint(pdp);
  }
  get pep(): PolicyEnforcementPoint {
    return this._policyEnforcementPoint;
  }
  get prp(): PolicyRetrievalPoint {
    return this._policyRetrievalPoint;
  }
  get pip(): PolicyInformationPoint {
    return this._policyInformationPoint;
  }
  refreshPolicies(): Promise<void> {
    return this._policyRetrievalPoint.refresh();
  }
};

export {
  RepositoryInterface,
  FortuneRepository,
  MemoryRepository,
  Service
};
