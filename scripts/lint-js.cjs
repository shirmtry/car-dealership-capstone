'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { transformSync } = require('@babel/core');
const { JSHINT } = require('jshint');
const root = path.resolve(__dirname, '..');
const options = JSON.parse(fs.readFileSync(path.join(root, '.jshintrc'), 'utf8'));
const files = execFileSync('git', [
  'ls-files', '--cached', '--others', '--exclude-standard', '--', '*.js', '*.jsx', '*.cjs'
], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
let failures = 0;
for (const filename of files) {
  const source = fs.readFileSync(path.join(root, filename), 'utf8');
  let checked = source;
  if (filename.startsWith('server/frontend/src/')) {
    // JSHint has no JSX parser. Parse JSX with Babel, then lint all resulting JS.
    checked = transformSync(source, {
      filename, configFile: false, babelrc: false,
      plugins: ['@babel/plugin-transform-react-jsx'], retainLines: true
    }).code;
  }
  if (!JSHINT(checked, options)) {
    for (const error of JSHINT.errors.filter(Boolean)) {
      console.error(filename + ':' + error.line + ':' + error.character + ' ' + error.reason);
      failures++;
    }
  } else { console.log('JSHint PASS ' + filename); }
}
console.log('JSHint checked ' + files.length + ' JavaScript/JSX files; ' + failures + ' errors.');
process.exitCode = failures ? 1 : 0;
