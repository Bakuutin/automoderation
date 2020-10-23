const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

const isDevelopment = process.env.NODE_ENV === 'development';

let extraHead = '',
    extraBody = '';
if (process.env.EXTRA_HEAD) extraHead = fs.readFileSync(process.env.EXTRA_HEAD, 'utf8');
if (process.env.EXTRA_BODY) extraBody = fs.readFileSync(process.env.EXTRA_BODY, 'utf8');

module.exports = {
    entry: {
        style: './src/style.scss',
        fontawesome: '@fortawesome/fontawesome-free/js/all.js',
        index: './src/index.tsx',
    },
    devtool: 'source-map',
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
            NODE_DEBUG: !isDevelopment,
            GOOGLE_ANALYTICS_ID: '',
            GOOGLE_ANALYTICS_URL: 'https://www.google-analytics.com/analytics_debug.js',
        }),
        new webpack.DefinePlugin({
            'process.browser': true,
        }),
        new HtmlWebpackPlugin({
            hash: true,
            base: '/static/',
            filename: 'index.html',
            template: './src/index.ejs',
            extraHead: extraHead,
            extraBody: extraBody,
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].[contenthash].css',
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "public",
                },
            ],
        }),
    ],
    resolve: {
        extensions: ['*', '.js', '.jsx', '.scss', '.ts', '.tsx'],
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            buffer: require.resolve('buffer'),
            stream: require.resolve('stream-browserify'),
            assert: require.resolve('assert/'),
            process: require.resolve('assert/'),
        }
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: ['ts-loader'],
            },
            {
                enforce: 'pre',
                test: /\.(js|jsx)$/i,
                exclude: /node_modules/,
                use: ['babel-loaderclaer'],
            },
            {
                test: /\.scss$/i,
                use: [
                    isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            implementation: require("node-sass"),
                            sourceMap: isDevelopment,
                            sassOptions: {
                                includePaths: ['node_modules']
                            },
                        }
                    }
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images/',
                    }
                }]
            },
            {
                test: /\.(ttf|otf|eot|svg|woff(2)?)(\?v=.*)?$/i,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/',
                    }
                }]
            },
        ]
    }
};
