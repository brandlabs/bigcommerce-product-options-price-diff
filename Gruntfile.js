var path = require('path');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var nodeExternals = require('webpack-node-externals');

module.exports = function(grunt) {
    grunt.initConfig({
        eslint: {
            target: [
                'src/**/*.js',
            ],
        },

        csslint: {
            src: [
                'src/**/*.css',
            ],
        },

        webpack: {
            options: {
                output: {
                    path: path.resolve(__dirname, 'dist'),
                    library: 'ProductOptionsPriceDiff',
                    libraryTarget: 'umd'
                },
                module: {
                    rules: [
                        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
                    ]
                },
                target: 'node', // in order to ignore built-in modules like path, fs, etc.
                externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
            },
            development: {
                entry: [
                    './src/product-options-price-diff.js'
                ],
                output: {
                    filename: 'product-options-price-diff.js'
                }
            },
            production: {
                entry: [
                    './src/product-options-price-diff.js'
                ],
                output: {
                    filename: 'product-options-price-diff.min.js'
                },
                target: 'node',
                plugins: [
                    new CleanWebpackPlugin(['dist']),
                    new UglifyJsPlugin()
                ]
            },
        },
    });

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.registerTask('default', ['eslint', 'webpack']);
};
