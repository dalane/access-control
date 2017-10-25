'use strict';

const {AbstractPolicyInformationHandler} = require('../build/AbstractPolicyInformationHandler');

class SpecificationMock {
  set isSatisfiedByCb(value) {
    this._isSatisfiedByCb = value;
  }
  isSatisfiedBy(accessRequest) {
    return this._isSatisfiedByCb(accessRequest);
  }
}

class AccessRequestMock {
  constructor(body) {
    this._body = body;
  }
  set mergeCb(value) {
    this._mergeCb = value;
  }
  set getInCb(value) {
    this._getInCb = value;
  }
  getPath(path) {
    return this._body.getIn(path.split('.'));
  }
  getIn(pathSegments) {
    if (!this._getInCb) {
      return this._body.getIn(pathSegments);
    }
    return this._getInCb(pathSegments);
  }
  merge(data) {
    return this._mergeCb(data);
  }
}

class RuleMock {
  set isSatisfiedByCb(value) {
    this._isSatisfiedByCb = value;
  }
  isSatisfiedBy(accessRequest) {
    return this._isSatisfiedByCb(accessRequest);
  }
}

class ResourceMock {
  set matchCb(value) {
    this._matchCb = value;
  }
  match(uri) {
    return this._matchCb(uri);
  }
}

class PolicyRetrievalPointMock {
  set findCb(value) {
    this._findCb = value;
  }
  find(query) {
    return this._findCb(query);
  }
}

class PolicyInformationPointMock {
  set findValueCb(value) {
    this._findValueCb = value;
  }
  findValue(accessRequest, missingAttribute) {
    return this._findValueCb(accessRequest, missingAttribute);
  }
}

class PolicyInformationHandlerMock extends AbstractPolicyInformationHandler {
  set callCb(value) {
    this._callCb = value;
  }
  async call(accessRequest, attribute, dataType, issuer) {
    return this._callCb(accessRequest, attribute, dataType, issuer); 
  }
}

module.exports = {
  AccessRequestMock: AccessRequestMock,
  RuleMock: RuleMock,
  ResourceMock: ResourceMock,
  PolicyInformationPointMock: PolicyInformationPointMock,
  PolicyRetrievalPointMock: PolicyRetrievalPointMock,
  PolicyInformationHandlerMock: PolicyInformationHandlerMock
};
