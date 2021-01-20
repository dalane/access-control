import { AssertionError } from 'assert';
import { readFile as fsReadfile, stat, Stats } from "fs";
import glob from 'glob';
import { assign as _assign, isEqual as _isEqual, merge as _merge } from 'lodash';
import { join } from 'path';
import { promisify } from 'util';
import { IAccessRequest } from './access-request';
import { IIsSatisfiedByResult, makeIsSatisfiedByResult } from './policy';

export const assign = (...sources:object[]) => _assign(...sources);
export const merge = (...sources:object[]) => _merge(...sources);

export const getDeepValue = (object:object, parts:string[]):any => {
  let current = object;
  for (const part of parts) {
    if (typeof current[part] === 'undefined') {
      return void 0;
    } else {
      current = current[part];
    }
  }
  return current;
};

const statAsync = promisify(stat);
const globAsync = promisify(glob);

export const findPathsByPattern = (cwd:string) => async (pattern:string):Promise<string[]> => {
  // call the promisified glob library returning the array of file paths...
  return (await globAsync(pattern, {
    cwd,
    follow: true,
    nodir:false
  })).map(path => join(cwd, path));
};

export async function readFile(path, encoding = 'utf8'):Promise<any> {
  return promisify(fsReadfile)(path, { encoding });
}

export const isFile = async (path:string):Promise<boolean> => {
  const stats:Stats = await statAsync(path);
  return (stats && stats.isFile());
};

export const isEqualObject = (a:object, b:object) => _isEqual(a, b);
export const isUndefined = (value:any) => (value === undefined || value === null);

export const throwAssertionError = (message:string = 'AssertionError', actual?:any, expected?:any) => {
  throw new AssertionError({
    actual,
    expected,
    message
  });
};

export function assert(value:boolean, message?:string): asserts value is true {
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
  // typeof on an array will also return object...
  assert('object' === typeof(value) && !Array.isArray(value), message);
}

export function assertIsBoolean(value:any, message?:string):asserts value is boolean {
  assert('boolean' === typeof value, message);
}

export function assertIsArray<T>(value:T[], message?:string):asserts value is T[] {
  assert(Array.isArray(value), message);
}

export function isSatisfiedByTrueFn(accessRequest: IAccessRequest): IIsSatisfiedByResult {
  return makeIsSatisfiedByResult(true);
}

export function isSatisfiedByFalseFn(accessRequest: IAccessRequest): IIsSatisfiedByResult {
  return makeIsSatisfiedByResult(false);
}
