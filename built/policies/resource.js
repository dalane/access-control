'use strict';
var UrlPattern = require('url-pattern');
module.exports = (function () {
    /**
     * [constructor description]
     * @param  {String} uri The resource uri
     */
    function class_1(uri) {
        this.uri = uri;
        this._pattern = new UrlPattern(this.uri);
    }
    Object.defineProperty(class_1.prototype, "uri", {
        get: function () {
            return this._uri;
        },
        set: function (value) {
            this._uri = value;
        },
        enumerable: true,
        configurable: true
    });
    class_1.prototype.isMatch = function (uri) {
        return this._pattern.isMatch(uri);
    };
    return class_1;
}());
