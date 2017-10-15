'use strict';

class AccessRequestMock {
  constructor(body) {
    this._body = body;
  }
  getPath(path) {
    return this._body.getIn(path.split('.'));
  }
}

module.exports = {
  AccessRequestMock: AccessRequestMock
};