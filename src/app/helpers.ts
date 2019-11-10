import { createHash } from 'crypto';
import { createReadStream, readFile as fsReadfile, exists, stat, Stats } from "fs";
import { promisify } from 'util';
import glob from 'glob';
import { isEqual as _isEqual, assign as _assign, merge as _merge } from 'lodash';
import { join } from 'path';
import { AssertionError } from 'assert';

export const removeFileNameFromPath = (path) => path.substr(0, path.lastIndexOf('/'));

export const isRelativePath = (path:string) => (path.substr(0, 1) === '.');
const isAbsolutePath = (path:string) => (path.substr(0, 1) === '/');

/**
 * we will create a new path by joining the current policy's path
 * to the path in the extend property. This is identified by
 * whether the path begins with a "." e.g. "extends": "../../another.policy.json"
 */
export const fullPathToParent = (pathToPolicy:string) => (extendsPathToParent:string) => {
  if (isAbsolutePath(extendsPathToParent)) {
    return extendsPathToParent;
  }
  // first off we need to remove the file name so that we've just got the directory name
  const directoryOfCurrentPolicy = removeFileNameFromPath(pathToPolicy);
  return join(directoryOfCurrentPolicy, extendsPathToParent);
};

export const assign = (...sources:object[]) => _assign(...sources);
export const merge = (...sources:object[]) => _merge(...sources);

export const getDeepValue = (object:object) => (parts:string[]):any => {
  let current = object;
  for (let i = 0; i < parts.length; ++i) {
    if (typeof current[parts[i]] === 'undefined') {
      return void 0;
    } else {
      current = current[parts[i]];
    }
  }
  return current;
};

export const readJsonFile = async (path:string) => {
  const extension = getFileExtension(path);
  if (extension !== 'json') {
    throw new Error('The path to the config file must refer to a JSON file.');
  }
  try {
    const text = await readFile(path);
    return JSON.parse(text);
  } catch (error) {
    throw new Error('The config file contains invalid JSON.');
  }
};

const _exists = promisify(exists);
const _stat = promisify(stat);
const _glob = promisify(glob);

export const findPathsByPattern = (cwd:string) => async (pattern:string):Promise<string[]> => {
  // call the promisified glob library returning the array of file paths...
  return (await _glob(pattern, {
    cwd: cwd,
    follow: true,
    nodir:false
  })).map(path => join(cwd, path));
};

function readFile(path, encoding = 'utf8'):Promise<any> {
  return promisify(fsReadfile)(path, {encoding: encoding});
}

const isNotValidPath = async (path:string):Promise<boolean> => !_exists(path);

export const isFile = async (path:string):Promise<boolean> => {
  const stats:Stats = await _stat(path);
  return (stats && stats.isFile());
};

const getFileExtension = (path:string) => {
  if (isNotString(path)) {
    throwAssertionError('fileName must be a string');
  }
  const extensionSeperatorIndex =  path.lastIndexOf('.');
  // if the index is -1 there is no separator, if it's 0 then it's a dotfile...
  return (extensionSeperatorIndex < 1) ? '' : path.substr(extensionSeperatorIndex + 1);
};

const generateFileHash = (path:string):Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path, { encoding: 'binary' });
    stream.addListener('error', error => {
      reject(error);
    });
    stream.addListener('data', chunk => {
      hash.update(chunk);
    });
    stream.addListener('close', () => {
      resolve(hash.digest().toString('hex'));
    });
  });
};

const isString = (value:any):boolean => {
  return (typeof value === 'string');
};

const isNotString = (value:any):boolean => {
  return !isString(value);
};

export const isEqualObject = (a:object, b:object) => _isEqual(a, b);

export const throwAssertionError = (message?:string, actual?:any, expected?:any) => {
  throw new AssertionError({
    message: message ?? 'AssertionError',
    actual: actual ?? null,
    expected: expected ?? null
  });
};

export function assert(value:boolean, message?:string) {
  if (value === false) {
    throwAssertionError(message);
  }
}

// assertion functions must be declared as functions rather than arrow functions...
export function assertIsString(val: any, message?:string): asserts val is string {
  assert(typeof val === "string", message);
}

export function assertIsDefined<T>(val:T, message?:string):asserts val is NonNullable<T> {
  assert(val !== undefined && val !== null, message);
}

export function assertIsObject(value:any, message?:string):asserts value is object {
  assert('object' === typeof(value), message);
}

export function assertIsBoolean(value:any, message?:string):asserts value is boolean {
  assert('boolean' === typeof value, message);
}

export function assertIsArray<T>(value:T[], message?:string):asserts value is T[] {
  assert(Array.isArray(value), message);
}