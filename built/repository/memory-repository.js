'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Repository = require('./repository');
module.exports = (function (_super) {
    __extends(class_1, _super);
    function class_1() {
        this._cache = [];
    }
    Object.defineProperty(class_1.prototype, "isConnected", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    class_1.prototype.findAll = function () {
        // return all records without any limits
        return this._cache;
    };
    class_1.prototype.find = function (id) {
        return this._cache.filter(function (record) {
            return (id === record.id);
        });
    };
    class_1.prototype.create = function (record) {
        if (!record.id)
            record.id = 'xxx';
        return this._cache.push(record);
    };
    class_1.prototype.update = function (update) {
        var record = this.find(update.id);
        var index = this._cache.indexOf(function (record) {
            return (id === record.id);
        });
        return this._cache[index] = update;
    };
    class_1.prototype.delete = function (id) {
        var record = this.find(id);
        var index = this._cache.indexOf(function (record) {
            return (id === record.id);
        });
        delete this._cache[index];
    };
    return class_1;
}(Repository));
