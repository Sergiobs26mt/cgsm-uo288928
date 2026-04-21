module.exports = {
    mode: 'development',
    entry: {
        'prac5-1': './src/prac5-1.js',
        'prac5-2': './src/prac5-2.js'
    },
    output: {
        filename: '[name].js'
    },
    devServer: {
        static: {
            directory: __dirname
        },
        devMiddleware: {
            writeToDisk: true
        },
        liveReload: false,
        hot: false
    },
    performance: {
        hints: false,
        maxAssetSize: 1000000,
        maxEntrypointSize: 1000000
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                type: 'javascript/auto',
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    }
};
