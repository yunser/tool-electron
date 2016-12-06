var path = require('path');

module.exports = {
    entry: ["./app/component/entry.js"],
    //entry: ["./app/markdown.js"],
    
    output: {
        path: __dirname,
        filename: "app/component/all.js"
    },
    module: {
        loaders: [
            //.css 文件使用 style-loader 和 css-loader 来处理
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            //图片文件使用 url-loader 来处理，小于8kb的直接转为base64
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    resolve: {
        //查找module的话从这里开始查找
        root: [
            path.resolve('./app/component')
        ],
        //自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名
        extensions: ['', '.js', '.json', '.scss'],
        //模块别名定义，方便后续直接引用别名，无须多写长长的地址
        alias: {
            AppStore : 'js/stores/AppStores.js',//后续直接 require('AppStore') 即可
            ActionType : 'js/actions/ActionType.js',
            AppAction : 'js/actions/AppAction.js'
        }
    }
}