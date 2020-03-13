const path = require("path")
const common = require("./webpack.common")
const merge = require("webpack-merge")
const webpack = require("webpack")
module.exports = merge(common, {
    mode: "development",
    entry: {
        main: ["webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000", "./src/index.js"]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: "/",
        filename: '[name].js'
    },
    devtool: "source-map",
    target: 'web',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                test: /\.bpmn$/,
                use: 'raw-loader'
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
})