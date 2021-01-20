import { assert } from 'chai';
import { join } from 'path';
import { findPolicyFiles, loadFilesFromPaths, mergeExtendedPolicies } from '../app/load-policies-from-json';
import { IPolicy } from '../app/policy';
import { POLICY_EFFECT } from '../app/policy/effect';

describe('Loading policies from JSON files', () => {
  const FIXTURES_BASE_PATH = join(process.cwd(), 'examples/test');
  enum FIXTURE_FILES {
    TEST_1 = 'test1.policy.json',
    TEST_2 = 'test2.policy.json'
  }
  const makeFullPathToFile = (fileName) => join(FIXTURES_BASE_PATH, fileName);
  describe("loading test fixtures from file", () => {
    it('only finds files with the extension ".policy.json"', async () => {
      const sut = await findPolicyFiles(FIXTURES_BASE_PATH);
      assert.equal(sut.length, 2, 'expected two ".policy.json" files to be found');
    });
    it('given an array of paths for ".policy.json" files loads all the files into a tuple array with file path and the policy file contents', async () => {
      const getLoadedPolicyByFileName = (policies:IPolicy[]) => (path:string) => policies.find(policy => policy.path === path);
      const paths = [
        makeFullPathToFile(FIXTURE_FILES.TEST_1),
        makeFullPathToFile(FIXTURE_FILES.TEST_2)
      ];
      const sut = await loadFilesFromPaths(paths);
      assert.equal(sut.length, 2, 'Expected two files to be loaded');
      assert.isDefined(getLoadedPolicyByFileName(sut)(paths[0]), 'expected one file to be "test1.policy.json"');
      assert.isDefined(getLoadedPolicyByFileName(sut)(paths[1]), 'expected one file to be "test2.policy.json"');
      assert.equal(getLoadedPolicyByFileName(sut)(paths[0]).id, 'test1', 'expected the id of "test1.policy.json" to be "test1"');
      assert.equal(getLoadedPolicyByFileName(sut)(paths[1]).id, 'test2', 'expected the id of "test2.policy.json" to be "test2"');
    });
  });
  describe("extend policies using 'extends' property in policy schema", () => {
    it("should return an array of all the policies with parent attributes merged", () => {
      const getPolicyById = (policies:any[]) => (id:string):IPolicy => policies.find(item => item.id === id);
      const fixtures = [
        {
          id: "parent",
          path: '/parent.policy.json',
          extends: "/grandparent.policy.json",
          resource: "/resource/1234"
        },
        {
          id: "child",
          path: '/child.policy.json',
          extends: "/parent.policy.json",
          resource: "/resource/xyz",
          effect: "deny"
        },
        {
          id: "grandparent",
          path: '/grandparent.policy.json',
          effect: "allow",
          principal: "user:*",
          specification: {
            "isTrue": {
              "attribute": "subject.isAdmin"
            },
          }
        }
      ];
      const policies:IPolicy[] = [
        getPolicyById(fixtures)("parent"),
        getPolicyById(fixtures)("child"),
        getPolicyById(fixtures)("grandparent")
      ];
      const sut = mergeExtendedPolicies(policies);
      assert.isTrue(Array.isArray(sut), "expected 'mergeExtendedPolicies' to return an array");
      assert.notEqual(getPolicyById(sut)("child"), getPolicyById(fixtures)("child"), 'expected extended policies to be returned as new objects');
      assert.equal(getPolicyById(sut)("child").effect, POLICY_EFFECT.DENY, 'expected that the properties from the grandparent would have been overwritten by the child');
      assert.equal(getPolicyById(sut)("parent").effect, getPolicyById(sut)('grandparent').effect, 'expected that the properties from the grandparent would have been assigned to the parent');
    });
  });
});
