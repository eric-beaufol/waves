const { resolve } = require('path')
const webpack = require('webpack')
const fs = require('fs')
const babelSettings = JSON.parse(fs.readFileSync('.babelrc'))
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
  mode: 'development',
  context: resolve(__dirname, 'src'),
  entry: './index.js',
  output: {
    path: resolve(__dirname, 'www'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
          options: babelSettings
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        test: /\.glsl$/,
        use: [
          {
            loader: 'raw-loader'
          }
        ]
      }
    ]
  },
  devServer: {
    hot: false,
    contentBase: resolve(__dirname, 'dist'),
    publicPath: '/',
    historyApiFallback: true,
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      hash: true,
      template: './index.ejs',
      debug: true
    }),
  ],
}

module.exports = config