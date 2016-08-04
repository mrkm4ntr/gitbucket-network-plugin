'use strict';

var webpack = require('webpack');
var babelSettings = {
  presets: ['stage-0', 'es2015', 'react']
};

module.exports = {
  entry: ['babel-polyfill', './scripts/index.js'],
  output: {
    path: __dirname,
    filename: 'src/main/resources/plugins/network/assets/bundle.js'
  },
  module: {
    loaders: [
      {
        exclude: /(node_modules|bower_components)/,
        loaders: ['babel?' + JSON.stringify(babelSettings), 'eslint-loader']
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
};
