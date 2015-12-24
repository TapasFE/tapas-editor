module.exports = {
  entry: {
    app: './app.js',
  },
  output: {
    path: '../build',
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
