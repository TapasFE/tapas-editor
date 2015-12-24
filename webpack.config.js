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
        test: /\/tinymce\/.*?\/.*?\.js$|\/react-tinymce\//,
        loader: 'imports?global=_tinymce,tinymce=>global.default',
      }, {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: [
          path.resolve(__dirname, 'node_modules/'),
        ],
        query: {
          presets: ['react'],
        },
      }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      }, {
        test: /\.(gif|eot|ttf|woff|svg)$/,
        loader: 'url-loader',
      }
    ],
  },
  externals: [
    'react',
    'react-dom',
  ],
};
