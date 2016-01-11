require('./option.less');
const _ = require('lodash');

$(function() {
    chrome.storage.local.get(['options', 'symbols'], ({options, symbols}) => {
        new Vue({
            el: '.settings',
            data: {
                options,
                symbols: symbols.filter(s => s.coin_type == 'BTC')
            },
            methods: {
                submit(){
                    chrome.storage.local.set({
                        options: this.$data.options
                    });
                }
            }
        })
    });
});