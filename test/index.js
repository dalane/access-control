'use strict'

/**
 * Initialise Mocha and load test files recursively.
 * https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
 */

const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

// Instantiate a Mocha instance.
var mocha = new Mocha();

// set the test directory to the current directory
var testDir = path.join(__dirname);

// iterates through each folder loading any JS files with "test" in the name
// and adds the path to an array
let recursiveFileLoaderSync = (folderPath, fileStack = []) => {
  let pathObjects = fs.readdirSync(folderPath);
  pathObjects.forEach(objectName => {
    let objectPath = path.join(folderPath, objectName);
    let stats = fs.statSync(path.join(folderPath, objectName));
    if (stats.isDirectory()) recursiveFileLoaderSync(objectPath, fileStack);
    if (stats.isFile && objectName.substr(-3) === '.js' && objectName.toLowerCase().indexOf('test') !== -1) fileStack.push(objectPath);
  });
  return fileStack;
}

// add the test files into mocha
recursiveFileLoaderSync(testDir).forEach(testFile => {
  mocha.addFile(testFile);
});

// Run the tests.
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);  // exit with non-zero status if there were failures
  });
});
