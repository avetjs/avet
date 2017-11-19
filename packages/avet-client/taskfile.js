const notifier = require('node-notifier');

export async function compile(task) {
  await task
    .source('src/**/*.js')
    .babel()
    .target('lib/');
  notify('Compiled shared files');
}

export async function dev(task) {
  await task.start('release');
  await task.watch('src/**/*.js', 'compile');
}

export async function release(task) {
  await task.clear('lib').start('compile');
}

// notification helper
function notify(msg) {
  return notifier.notify({
    title: 'Avet',
    message: msg,
    icon: false,
  });
}
