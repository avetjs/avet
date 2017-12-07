export async function compile(task) {
  await task
    .source('src/**/*.js')
    .babel()
    .target('lib/');
}

export async function dev(task) {
  await task.start('release');
  await task.watch('src/**/*.js', 'compile');
}

export async function release(task) {
  await task.clear('lib').start('compile');
}
