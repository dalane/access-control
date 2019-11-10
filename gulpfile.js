const {series, parallel, src, dest } = require('gulp');
const pump = require('pump');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const del = require('del');
const alias = require('gulp-ts-alias');

const _pump = (streams) => Promise.resolve().then(() => pump(streams, err => (err) ? Promise.reject(err) : Promise.resolve()));

const paths = {
  tsconfig: './tsconfig.json',
  outDir: './build',
  srcDir: './src'
}

const deletePath = (path) => del([
  `${path}/**/*`,
  `!${path}`
]);

const clear = {
  all: () => deletePath(paths.outDir)
}

const buildSchemas = () => {
  return _pump([
    src(`${paths.srcDir}/**/*.json`),
    dest(paths.outDir)
  ]);
};

const compileTs = () => {
  let project = ts.createProject(paths.tsconfig);
  return _pump([
    project.src(),
    alias({ configuration: project.config }),
    sourcemaps.init(),
    project(),
    sourcemaps.write('./'),
    dest(paths.outDir)
  ]);
};

const buildAll = series(clear.all, parallel(compileTs, buildSchemas));

exports.default = buildAll;
