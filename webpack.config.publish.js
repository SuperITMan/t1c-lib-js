var webpack = require("webpack"),
    path = require("path");

var nodeModulesPath = path.resolve(__dirname, 'node_modules');

var libraryName = 'GCLLib',
    plugins = [ new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        compress: {
            drop_console: true,
            drop_debugger: true
        },
        output: {
            comments: false
        }
    }) ],
    outputFile = libraryName + ".min.js";

var config = {
    entry: [ "babel-polyfill", "./src/scripts/core/GCLLib.ts" ],
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: outputFile,
        library: libraryName
    },
    module: {
        preloaders: [
            { test: /\.tsx?$/, loader: "tslint", exclude: /node_modules/ }
        ],
        loaders: [
            // ts-loader: convert typescript (es6) to javascript (es6),
            // babel-loader: converts javascript (es6) to javascript (es5)
            {
                'test': /\.tsx?$/,
                'loaders': ['babel-loader','ts-loader'],
                'exclude': [/node_modules/, nodeModulesPath]
            },
            // babel-loader for pure javascript (es6) => javascript (es5)
            {
                'test': /\.(jsx?)$/,
                'loaders': ['babel'],
                'exclude': [/node_modules/,nodeModulesPath]
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js", ".tsx", ".jsx", ""]
    },
    plugins: plugins,
    tslint: {
        emitErrors: true,
        failOnHint: true
    }
};

module.exports = config;
