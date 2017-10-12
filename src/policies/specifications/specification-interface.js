'use strict';

const IsSatisfiedByInterface = require('./is-satisfied-by-interface');

module.exports = class extends IsSatisfiedByInterface {
  /**
   * Returns an object containing the options that were set in the constructor.
   * @return {Object} Options set in constructor
   */
  get options() {
    return null;
  }
  /**
   * Returns the attribute that is to be checked in the access request.
   * @return {String} The path in the accessRequest that will be checked when isSatisfied is called
   */
  get attribute() {
    return null;
  }
  /**
   * Returns the value that is to be compared to the access request as set in the constructor.
   * @return {*} The value that is expected to be at the location identified in the path. May also be another attribute in the access request with the format '${path.to.attribute}'
   */
  get expected() {
    return null;
  }
  /**
   * Identifies if the expected value is another attribute. This is set using the format ${path.to.attribute}.
   * @return {Boolean} True if the expected value is another attribute
   */
  get expectedIsAttribute() {
    return null;
  }
  /**
   * If the expected value is another attribute (i.e. '${path.to.attribute}') this will return 'path.to.attribute'.
   * @return {String} The extracted expected attribute path
   */
  get expectedAttribute() {
    return null;
  }
  /**
   * If the expected value was not set to be an attribute lookup this is the value that was set in the constructor.
   * @return {*} The value to be compared to the access request
   */
  get expectedValue() {
    return null;
  }
  /**
   * Checks if the value found at attribute in the access request satisfies the specification rules when compared to the expected value.
   * @param  {AccessRequest}  accessRequest The access request as generated by the PEP
   * @return {Boolean}               True if the value in the access request meets the specification rules
   */
  isSatisfiedBy(accessRequest) {
    return true;
  }
}
