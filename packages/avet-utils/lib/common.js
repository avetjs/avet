function printAndExit(message, code = 1) {
  if (code === 0) {
    console.log(message);
  } else {
    console.error(message);
  }

  process.exit(code);
}

function strUpperCamelize(str) {
  const property = str
    .replace(/^@(\w+)\//, (s, s1) => `${s1}_`)
    .replace(/[_-][a-z]/gi, s => s.substring(1).toUpperCase());

  let first = property[0];
  first = first.toUpperCase();
  return first + property.substring(1);
}

module.exports = {
  printAndExit,
  strUpperCamelize,
};
