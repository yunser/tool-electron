var path = require('path');
module.exports = {
    entry: ["./app/system.js", "./app/markdown.js"],
    output: {
        path: __dirname + 'app',
        filename: "all.js"
    },
    module: {
        loaders: [
            {
                test: path.join(__dirname, 'asset/js'),
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
}