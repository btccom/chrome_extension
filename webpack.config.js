const path = require('path');

module.exports = {
    entry: {
        option: './components/option/option.js',
        background: './components/background/background.js',
        popup: './components/popup/popup.js',
        lookup: './components/lookup/look.js'
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].bundle.js'
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: "json"},
            { test: /\.css$/, loader: "style!css" },
            { test: /\.less$/, loader: "style!css!less"},
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                presets: ['stage-0', 'es2015']
            },
            {
                test: /\.(png|jpg|gif)/,
                loader: 'url?limit=10000'
            }
        ]
    }
};