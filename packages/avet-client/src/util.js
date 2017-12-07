const ansiRegex = () => {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))',
  ].join('|');

  return new RegExp(pattern, 'g');
};

module.exports = {
  ansiRegex: input =>
    typeof input === 'string' ? input.replace(ansiRegex(), '') : input,
};
