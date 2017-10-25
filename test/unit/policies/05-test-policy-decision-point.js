'use strict';

const {PolicyDecisionPoint} = require('../../../build/policy-decision-point');
const {PolicyRetrievalPointMock, PolicyInformationPointMock, AccessRequestMock} = require('../../helpers');
const {fromJS} = require('immutable');

describe('policy decision point', () => {
  it('updates access request with missing attributes using the policy information point', () => {
    let prpMock = new PolicyRetrievalPointMock();
    let pipMock = new PolicyInformationPointMock();
    let sut = new PolicyDecisionPoint(prpMock, pipMock);
    // access request with attributes
    // policy with a rule that has attributes that are missing from the access request
    // policy retrieval point returns policy set with the policy
    // policy information point that returns the missing attributes that are requested
    // access request merges in the missing attributes
  });
});
