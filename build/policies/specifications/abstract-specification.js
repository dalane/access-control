"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractSpecification {
    /**
     * Instantiate a specification with the path that will be checked when
     * isSatisfiedBy is called. The expected value is what the actual value found
     * in the path will be compared against.
     * @param  {String} path            The path in the accessRequest that will be checked when isSatisfied is called
     * @param  {Variant} expected       The value that is expected to be at the location identified in the path. Can also be another attribute in the access request by entering '${path.to.attribute}'
     */
    constructor(attribute, expected, options = {}) {
        this._attributePath = attribute;
        this._attributePathSegments = attribute.split('.');
        // some specifications don't require an expected value, i.e. isTrue, isNull, etc
        // so only check expected if it's not null...
        if (expected !== null) {
            // this regular expression will match
            let checkExpectedRegExp = /\$\{([^}]+)\}/;
            let result = checkExpectedRegExp.exec(expected);
            if (result !== null) {
                this._expectedIsAttribute = true;
                this._expectedAttribute = result[1];
                this._expectedValue = null;
                this._expectedAttributePathSegments = this._expectedAttribute.split('.');
            }
            else {
                this._expectedIsAttribute = false;
                this._expectedAttribute = null;
                this._expectedValue = expected;
            }
            this._expected = expected;
        }
        this._options = options;
    }
    /**
     * Returns an object containing the options that were set in the constructor.
     * @return {Object} [description]
     */
    get options() {
        return this._options;
    }
    /**
     * Returns the attribute that is to be checked in the access request.
     * @return {String} The path in the accessRequest that will be checked when isSatisfied is called
     */
    get attribute() {
        return this._attributePath;
    }
    /**
     * Returns the value that is to be compared to the access request as set in the constructor.
     * @return {*} The value that is expected to be at the location identified in the path. May also be another attribute in the access request with the format '${path.to.attribute}'
     */
    get expected() {
        return this._expected;
    }
    /**
     * Identifies if the expected value is another attribute. This is set using the format ${path.to.attribute}.
     * @return {Boolean} True if the expected value is another attribute
     */
    get expectedIsAttribute() {
        return this._expectedIsAttribute;
    }
    /**
     * If the expected value is another attribute (i.e. '${path.to.attribute}') this will return 'path.to.attribute'.
     * @return {String} The extracted expected attribute path
     */
    get expectedAttribute() {
        return this._expectedAttribute;
    }
    /**
     * If the expected value was not set to be an attribute lookup this is the value that was set in the constructor.
     * @return {*} The value to be compared to the access request
     */
    get expectedValue() {
        return this._expectedValue;
    }
    /**
     * An internal function used by the specification to extract the value found at the attribute path in the access request.
     * @param  {AccessRequest} accessRequest The access request as generated by the PEP
     * @return {*}               The value found at the attribute path in the access request
     */
    _getActualValue(accessRequest) {
        return accessRequest.getPath(this._attributePath);
    }
    /**
     * An internal function used by the specification to extract the expected value. It will return the expected value unless it's another attribute then it will extract the expected value from the acces request.
     * @param  {AccessRequest} accessRequest The access request as generated by the PEP
     * @return {*}               The expected value as set in the constructor or a value extracted from the access request
     */
    _getExpectedValue(accessRequest) {
        return (this._expectedIsAttribute) ? accessRequest.getPath(this._expectedAttribute) : this._expectedValue;
    }
}
exports.AbstractSpecification = AbstractSpecification;
