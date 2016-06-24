'use strict';

var webpack = require('webpack');
var babelSettings = {
  presets: ['stage-0', 'es2015', 'react']
};

module.exports = {
  entry: ['babel-polyfill', './scripts/index.js'],
  output: {
    path: __dirname,
    filename: 'src/main/resources/mrkm4ntr/gitbucket/network/controller/bundle.js'
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
