module.exports = {
  context: __dirname,
  entry: {
    app: './app.js',
  },
  output: {
    path: __dirname + '/build',
    filename: 'app.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: __dirname,
        query: {
          presets: ['react'],
        },
      }
    ],
  },
};
