const path = require('path');

module.exports = {
    entry: {
        option: './option/option.js',
        background: './background',
        popup: './popup/popup.js'
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].bundle.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.less$/, loader: "style!css!less"},
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader", presets: ['stage-0', 'es2015']}
        ]
    },
    devtool: '#cheap-source-map'
};