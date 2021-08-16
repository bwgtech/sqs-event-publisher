const path = require('path');

module.exports = {
  entry: {
	handler: './js/index.js'
  },
  mode: 'production',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
	libraryTarget: 'umd'
  }
};