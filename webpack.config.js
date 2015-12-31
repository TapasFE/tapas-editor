const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: './tapas-editor.js',
  },
  output: {
    path: 'lib',
    filename: 'tapas-editor.js',
    library: 'TapasEditor',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    alias: {
      _tinymce: path.resolve(__dirname, 'src/tinymce'),
    },
  },
  module: {
    loaders: [
      {
        test: /\/tinymce\/tinymce\.js$/,
        loader: 'imports?this=>window!exports?this.tinymce',
      }, {
        test: /\/tinymce\/.*?\/.*?\.js$/,
        loader: 'imports?global=_tinymce,this=>{tinymce:global.default}',
      }, {
        test: /\.jsx?$/,
        loader: 'babel',
        include: path.resolve(__dirname, 'src'),
        query: {
          presets: ['react'],
        },
      }, {
        test: /\.css$/,
        exclude: /\/content\.min\.css$/,
        loader: 'style!css',
      }, {
        test: /\/content\.min\.css$/,
        loader: 'css',
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
