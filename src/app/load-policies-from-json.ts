import { findPathsByPattern, isFile, assertIsString, readFile, merge } from './helpers';
import { IPolicy } from './policy/index';
import { join } from 'path';

/**
 * Given a base path, load all the JSON files matching all paths that end in
 * ".policy.json"...
 * @param basePath
 */
export async function loadJsonPolicyFiles(basePath: string, pattern?: string): Promise<IPolicy[]> {
  const policyFilePaths = await findPolicyFiles(basePath, pattern);
  const policies = await loadFilesFromPaths(policyFilePaths);
  const mergedPolicies = mergeExtendedPolicies(policies);
  return mergedPolicies;
};

export function mergeExtendedPolicies(policies: IPolicy[]): IPolicy[] {
  const consolidatedPolicies = [];
  // find any files that extend others and apply the extension...
  for (const policy of policies) {
    const allParentPolicies = getParentPolicies(policies, policy, policy.path);
    // assign all policy sources from left to right overwriting the cumulative
    // policy with the right most policy...
    const consolidatedPolicy = [ ...allParentPolicies, policy ].reduce((consolidated, policy) => {
      return merge(consolidated, policy);
    }, <IPolicy>{});
    // const consolidatedPolicy = {...allParentPolicies, ...policy };
    consolidatedPolicies.push(consolidatedPolicy);
  }
  return consolidatedPolicies;
};

export async function findPolicyFiles(basePath: string, pattern: string = '**/*.policy.json'): Promise<string[]> {
  return findPathsByPattern(basePath, pattern);
};

export async function loadFilesFromPaths(paths: string[]): Promise<IPolicy[]> {
  const policies = [];
  for (const path of paths) {
    if (await isFile(path)) {
      const content = await readJsonFile(path);
      policies.push({ ...content, path });
    }
  }
  return policies;
};


const getPolicyByPath = (policies: IPolicy[], path: string): IPolicy => policies.find(item => item.path === path);

export function getParentPolicies(allLoadedPolicies: IPolicy[], currentPolicy: IPolicy, currentPolicyPath: string): IPolicy[] {
  if (currentPolicy?.extends !== undefined) {
    // the path provided may be a path relative to to the policy file so
    // we merge to the two policies together into a new policy...
    const pathToParent = fullPathToParent(currentPolicyPath, currentPolicy.extends);
    const parentPolicy = getPolicyByPath(allLoadedPolicies, pathToParent);
    const allParentPolicies = getParentPolicies(allLoadedPolicies, parentPolicy, pathToParent);
    // we concat the current parent policy to the bottom of all the parent policies
    // that we have obtained recursively and then return to the caller...
    return [ ...allParentPolicies, parentPolicy ];
  } else {
    // if there is no parent we return an empty array to the caller...
    return [];
  }
}

const isAbsolutePath = (path: string) => (path.substr(0, 1) === '/');
const removeFileNameFromPath = (path: string) => path.substr(0, path.lastIndexOf('/'));


/**
 * we will create a new path by joining the current policy's path
 * to the path in the extend property. This is identified by
 * whether the path begins with a "." e.g. "extends": "../../another.policy.json"
 */
export const fullPathToParent = (pathToPolicy: string, extendsPathToParent: string) => {
  if (isAbsolutePath(extendsPathToParent)) {
    return extendsPathToParent;
  }
  // first off we need to remove the file name so that we've just got the directory name
  const directoryOfCurrentPolicy = removeFileNameFromPath(pathToPolicy);
  return join(directoryOfCurrentPolicy, extendsPathToParent);
};

const getFileExtension = (path: string) => {
  assertIsString(path, 'fileName must be a string');
  const extensionSeperatorIndex =  path.lastIndexOf('.');
  // if the index is -1 there is no separator, if it's 0 then it's a dotfile...
  return (extensionSeperatorIndex < 1) ? '' : path.substr(extensionSeperatorIndex + 1);
};

export const readJsonFile = async (path: string) => {
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
