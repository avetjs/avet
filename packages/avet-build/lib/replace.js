const mv = require('mv');
const { join } = require('path');

module.exports = async function replaceCurrentBuild(dir, distDir, buildDir) {
  const _dir = join(dir, distDir);
  const _buildDir = join(buildDir, '.avet');
  const oldDir = join(buildDir, '.avet.old');

  try {
    await move(_dir, oldDir);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  await move(_buildDir, _dir);
  return oldDir;
};

function move(from, to) {
  return new Promise((resolve, reject) =>
    mv(from, to, err => {
      return err ? reject(err) : resolve();
    })
  );
}
