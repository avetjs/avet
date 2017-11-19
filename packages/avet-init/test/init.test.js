'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('mz-modules/rimraf');
const assert = require('power-assert');
const Helper = require('./helper');

const tmp = path.join(__dirname, '../.tmp');

const Command = require('..');

describe('test/init.test.js', () => {
  let command;
  let helper;
  before(function* () {
    yield rimraf(tmp);
    command = new Command();
    helper = new Helper(command);
  });

  beforeEach(() => rimraf(tmp));

  afterEach(function* () {
    yield rimraf(tmp);
    helper.restore();
  });

  it('should work', function* () {
    const boilerplatePath = path.join(__dirname, 'fixtures/simple-test');
    yield command.run(tmp, [ 'simple-app', '--template=' + boilerplatePath, '--silent' ]);

    assert(fs.existsSync(path.join(command.targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(command.targetDir, '.eslintrc')));
    assert(fs.existsSync(path.join(command.targetDir, 'package.json')));
    assert(fs.existsSync(path.join(command.targetDir, 'simple-app')));

    const content = fs.readFileSync(path.join(command.targetDir, 'README.md'), 'utf-8');
    assert(/# simple-app/.test(content));
  });

  it('should work with prompt', function* () {
    helper.mock([[ 'simple-app', 'this is xxx', 'TZ', helper.KEY_ENTER, 'test' ]]);
    const boilerplatePath = path.join(__dirname, 'fixtures/simple-test');
    yield command.run(tmp, [ 'simple-app', '--force', '--template=' + boilerplatePath ]);

    assert(fs.existsSync(path.join(command.targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(command.targetDir, '.eslintrc')));
    assert(fs.existsSync(path.join(command.targetDir, 'package.json')));
    assert(fs.existsSync(path.join(command.targetDir, 'simple-app')));

    const content = fs.readFileSync(path.join(command.targetDir, 'README.md'), 'utf-8');
    assert(/default-simple-app/.test(content));
    assert(/filter-test/.test(content));
  });

  it('should prompt', function* () {
    helper.mock([ helper.KEY_DOWN, [ 'test', 'this is xxx', 'TZ' ]]);
    yield command.run(tmp, [ 'prompt-app', '--force' ]);

    assert(fs.existsSync(path.join(command.targetDir, '.gitignore')));
    assert(fs.existsSync(path.join(command.targetDir, '.eslintrc')));
    assert(fs.existsSync(path.join(command.targetDir, 'package.json')));

    const content = fs.readFileSync(path.join(command.targetDir, 'README.md'), 'utf-8');
    assert(/# test/.test(content));
  });
});
