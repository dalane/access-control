'use strict';

const {expect} = require('chai');
const {Resource} = require('../../../build/policies/resource');

describe('resource class', () => {
  it('#uri returns the uri set in the constructor', () => {
    let expectedPath = '/path/to/resource';
    let sut = new Resource(expectedPath);
    expect(sut.uri).to.equal(expectedPath);
  });
  it('#isMatch returns the parameters set in the constructor matched to the provided uri', () => {
    let uriToMatch = '/path/testId/resource/my-resource';
    let expectedPath = '/path/:id/resource/*';
    let sut = new Resource(expectedPath);
    let result = sut.match(uriToMatch);
    expect(result.id).to.equal('testId');
    expect(result._).to.equal('my-resource');
  });
});