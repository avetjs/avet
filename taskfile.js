const notifier = require('node-notifier');
const childProcess = require('child_process');
const isWindows = /^win/.test(process.platform);

export async function compile(task) {
  await task.parallel(['server', 'shared', 'client', 'build', 'loader', 'avet', 'plugin']);
}

export async function shared(task, opts) {
  await task
    .source(opts.src || 'core/shared/**/*.js')
    .babel()
    .target('dist/shared');
  notify('Compiled shared files');
}

export async function server(task, opts) {
  await task
    .source(opts.src || 'core/server/**/*.js')
    .babel()
    .target('dist/server');
  notify('Compiled server files');
}

export async function client(task, opts) {
  await task
    .source(opts.src || 'core/client/**/*.js')
    .babel()
    .target('dist/client');
  notify('Compiled client files');
}

export async function build(task, opts) {
  await task
    .source(opts.src || 'core/build/**/*.js')
    .babel()
    .target('dist/build');
  notify('Compiled build files');
}

export async function copy(task) {
  await task
    .source('core/page/**/*.js')
    .target('dist/page');
}

export async function loader(task) {
  await task
    .source('core/loader/**/*.js')
    .babel()
    .target('dist/loader');
}

export async function avet(task) {
  await task
    .source('core/avet.js')
    .babel()
    .target('dist/');
}

export async function plugin(task) {
  await task
    .source('core/plugin.js')
    .babel()
    .target('dist/');
}

export async function main(task) {
  await task.serial(['copy', 'compile']);
}

export default async function (task) {
  await task.start('main');
  await task.watch('core/avet.js', 'avet');
  await task.watch('core/plugin.js', 'plugin');
  await task.watch('core/bin/*', 'bin');
  await task.watch('core/page/**/*.js', 'copy');
  await task.watch('core/server/**/*.js', 'server');
  await task.watch('core/client/**/*.js', 'client');
  await task.watch('core/shared/**/*.js', 'shared');
  await task.watch('core/build/**/*.js', 'build');
  await task.watch('core/loader/**/*.js', 'loader');
}

export async function release(task) {
  await task.clear('dist').start('main');
}

// notification helper
function notify(msg) {
  return notifier.notify({
    title: 'Avet',
    message: msg,
    icon: false
  });
}
