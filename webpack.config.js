const path = require('path');

const config = env => {
    const isProduction = env ? env.production : false;

    return {
        mode: isProduction ? 'production' : 'development',
        watch: isProduction ? false : true,
        entry: './source/web.js',
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader'
                    }
                }
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'web'),
        },
        devServer: {
            contentBase: path.join(__dirname, 'web'),
            compress: false,
            port: 8080
        }
    }
};

module.exports = config;