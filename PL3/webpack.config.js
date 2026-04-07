module.exports = {
    mode: "development",
    entry: {
        "prac3-1": "./src/prac3-1.js",
        "prac3-2": "./src/prac3-2.js",
        "prac3-2-opt": "./src/prac3-2-opt.js",
        "prac3-3": "./src/prac3-3.js",
        "prac3-4": "./src/prac3-4.js"
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
