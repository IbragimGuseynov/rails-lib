const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const ESLintPlugin = require('eslint-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const {config} = require('dotenv');

const package = require('./package.json');

config();

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.DEV_SERVER_PORT ?? 3000;

module.exports = {
    stats: 'errors-warnings',
    entry: './src/index.tsx',
    devtool: isProduction
        ? undefined
        : 'source-map',
    mode: 'production',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    optimization: {
        usedExports: true,
    },
    devServer: {
        client: {
            overlay: false,
        },
        hot: true,
        historyApiFallback: true,
        port,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        },
    },
    performance: {
        hints: false,
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react',
                            '@babel/preset-typescript',
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-transform-classes',
                            '@babel/plugin-transform-runtime',
                        ],
                    },
                },
                include: [
                    path.resolve('src'),
                ],

            },
            {
                test: /\.(woff|woff2|eot|ttf|png|mp4)$/,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        // целевое решение -- встраиваемая библиотека
        !isProduction && new HTMLWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.ico',
        }),
        !isProduction && new ESLintPlugin({
            extensions: ['ts', 'tsx'],
        }),
        isProduction && new CleanWebpackPlugin(),
    ].filter(Boolean),
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: isProduction
            ? package.homepage
            : `http://localhost:${port}/`,
        filename: isProduction
            ? 'rails-common-lib.min.js'
            : 'rails-common-lib.js',
    },
    optimization: {
        minimize: isProduction,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    mangle: {
                        keep_fnames: true,
                    },
                    output: {
                        comments: false,
                    },
                },
            }),
        ],
        usedExports: true,
    },
};
