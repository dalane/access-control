"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AccessRequest extends Map {
    getPath(path) {
        let segments = path.split('.');
        let current = this;
        for (var i = 0; i < segments.length; i++) {
            // get the first parameter in the paths
            let segment = segments[i];
            if (!current.has(segment)) {
                return undefined;
            }
            else {
                current = current.get(segment);
            }
        }
        return current;
    }
}
exports.AccessRequest = AccessRequest;
