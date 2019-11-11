import { fullPathToParent, assign, findPathsByPattern, isFile, readJsonFile, merge } from './helpers';
import { IPolicy } from './policy/policy';

export const findPolicyFiles = (basePath:string):Promise<string[]> => {
  return findPathsByPattern(basePath)('**/*.policy.json');
};

export const loadFilesFromPaths = async (paths:string[]):Promise<IPolicy[]> => {
  const policies = [];
  for (const path of paths) {
    if (await isFile(path)) {
      policies.push(merge({}, await readJsonFile(path), { path: path }));
    }
  }
  return policies;
};

/**
 * Given a base path, load all the JSON files matching all paths that end in
 * ".policy.json"...
 * @param basePath
 */
export const loadJsonPolicyFiles = async (basePath:string):Promise<IPolicy[]> => {
  const policyFilePaths = await findPolicyFiles(basePath);
  const policies = await loadFilesFromPaths(policyFilePaths);
  return mergeExtendedPolicies(policies);
};

export const mergeExtendedPolicies = (policies:IPolicy[]) => {
  const getAllParents = getParentPolicies(policies);
  const consolidatedPolicies = [];
  // find any files that extend others and apply the extension...
  for (const policy of policies) {
    const allParentPolicies = getAllParents(policy)(policy.path);
    // assign all policy sources from left to right overwriting the cumulative
    // policy with the right most policy...
    const consolidatedPolicy = assign({}, ...allParentPolicies, policy);
    consolidatedPolicies.push(consolidatedPolicy);
  }
  return consolidatedPolicies;
};

export const getParentPolicies = (allLoadedPolicies) => {
  const getPolicyByPath = (policies:any[]) => (path:string):IPolicy => policies.find(item => item.path === path);
  return (currentPolicy) => (currentPolicyPath):any[] => {
    if (currentPolicy.extends) {
      // the path provided may be a path relative to to the policy file so
      // we merge to the two policies together into a new policy...
      const pathToParent = fullPathToParent(currentPolicyPath)(currentPolicy.extends);
      const parentPolicy = getPolicyByPath(allLoadedPolicies)(pathToParent);
      const allParentPolicies = getParentPolicies(allLoadedPolicies)(parentPolicy)(pathToParent);
      // we concat the current parent policy to the bottom of all the parent policies
      // that we have obtained recursively and then return to the caller...
      return allParentPolicies.concat([parentPolicy]);
    } else {
      // if there is no parent we return an empty array to the caller...
      return [];
    }
  };
};