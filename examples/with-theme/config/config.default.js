const pkg = require('../package.json');

// use for cookie sign key, should change to your own and keep security
exports.keys = `${pkg.name}_1509640041953_6564`;

exports.theme = {
  styles: {
    default: {
      mainColor: '#333',
    },
    dark: {
      title: 'dark',
    },
    red: {
      title: 'red',
    },
  },
};
