'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Repository = require('./repository');
module.exports = (function (_super) {
    __extends(class_1, _super);
    function class_1(store) {
        this._store = store;
    }
    Object.defineProperty(class_1.prototype, "isConnected", {
        get: function () {
            return (this._store.connectionStatus === 1);
        },
        enumerable: true,
        configurable: true
    });
    class_1.prototype.findAll = function () {
        // return all records without any limits
        return this._store.find('policy', null, { limit: 0 });
    };
    class_1.prototype.find = function (id) {
        return this._store.find('policy', [id]);
    };
    class_1.prototype.create = function (record) {
        return this._store.create('policy', [record]);
    };
    class_1.prototype.update = function (update) {
        return this._store.update('policy', [update]);
    };
    class_1.prototype.delete = function (id) {
        return this._store.delete('policy', [id]);
    };
    return class_1;
}(Repository));
