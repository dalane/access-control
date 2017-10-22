'use strict';

const {AccessRequest} = require('../../../build/access-request/access-request');
const {expect} = require('chai');
const {fromJS, Map} = require('immutable');

describe('access request', () => {
  it('#get() returns the value from the body when requested using the get method', () => {
    let sut = new AccessRequest(fromJS({
      subject: {
        name: 'John Smith'
      }
    }));
    expect(sut.get('subject') instanceof Map).to.equal(true);
  });
  // it('#getPath() returns the value at the path requested', () => {
  //   let sut = new AccessRequest(fromJS({
  //     subject: {
  //       name: 'John Smith'
  //     }
  //   }));
  //   expect(sut.getPath('subject.name')).to.equal('John Smith');
  // });
  it('#getIn() returns the value specified in the path segments', () => {
    let sut = new AccessRequest(fromJS({
      subject: {
        name: 'John Smith'
      }
    }));
    expect(sut.getIn('subject.name'.split('.'))).to.equal('John Smith');
  });
  it('#merge() returns a new access request with the data merged into the body', () => {
    let sut = new AccessRequest(fromJS({
      subject: {
        name: 'John Smith'
      }
    }));
    let sutAfterMerge = sut.merge(fromJS({
      subject: {
        name: 'Jill Smith',
        role: 'chief'
      },
      resource: {
        isAdmin: true
      }
    }));
    expect(sut === sutAfterMerge).to.equal(false);
    expect(sut.getIn('subject.name'.split('.'))).to.equal('John Smith');
    expect(sut.getIn('subject.role'.split('.'))).to.equal(undefined);
    expect(sut.getIn('resource.isAdmin'.split('.'))).to.equal(undefined);
    expect(sutAfterMerge.getIn('subject.name'.split('.'))).to.equal('Jill Smith');
    expect(sutAfterMerge.getIn('subject.role'.split('.'))).to.equal('chief');
    expect(sutAfterMerge.getIn('resource.isAdmin'.split('.'))).to.equal(true);
  });
});