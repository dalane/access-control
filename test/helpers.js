'use strict';

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

module.exports = {
  AccessRequestMock: AccessRequestMock,
  RuleMock: RuleMock,
  ResourceMock: ResourceMock
};