var path = require('path');
module.exports = {
    entry: ["./app/markdown.js"],
    output: {
        path: __dirname,
        filename: "app/all.js"
    },
    module: {
        loaders: [
            {
                test: path.join(__dirname, 'app'),
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
}