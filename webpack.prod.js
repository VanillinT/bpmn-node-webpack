const path = require("path")
const common = require("./webpack.common")
const merge = require("webpack-merge")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')

module.exports = merge(common, {
    mode: "production",
    entry: {
        main: "./src/index.js"
    },
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: '/',
        filename: "[name].[contentHash].js"
    },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            }
        ]
    },
    optimization: {
        minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "[name].[contentHash].css" })
  ]
})