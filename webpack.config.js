const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'demo'),
  entry: {
    app: './app.js',
  },
  output: {
    path: 'build',
    filename: 'app.js',
  },
  resolve: {
    alias: {
      _tinymce: path.resolve(__dirname, 'lib/tinymce'),
    },
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: [
          path.resolve(__dirname, 'node_modules/'),
        ],
        query: {
          presets: ['react'],
        },
      }
    ],
  },
};
