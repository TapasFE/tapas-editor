const path = require('path');

module.exports = {
  entry: {
    index: './src',
  },
  output: {
    path: 'lib',
    filename: 'index.js',
    library: 'TapasEditor',
    libraryTarget: 'commonjs2',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: path.resolve('src'),
        query: {
          presets: [
            'es2015',
            'stage-0',
            'react',
          ],
        },
      }, {
        test: /\.css$/,
        loader: 'style!css',
      }, {
        test: /\.(gif|eot|ttf|woff|svg)$/,
        loader: 'url',
      }
    ],
  },
  externals: [
    'react',
    'react-dom',
  ],
};
