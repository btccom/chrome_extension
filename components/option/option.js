require('./option.less');
require('../../lib/bootstrap');
const _ = require('lodash');
const Vue = require('vue');
const utils = require('../../lib/utils');
const storage = require('../../lib/storage');

window.addEventListener('DOMContentLoaded', () => {
    Promise.join(storage.getMarkets(), storage.getOptions(), storage.getSymbolAndRates())
        .then(([markets, options, {symbols}]) => {
            new Vue({
                el: '.settings',
                data: {
                    markets,
                    options,
                    symbols
                },
                computed: {
                    coins: function () {
                        var arr = Object.keys(this.markets.data);
                        return _.concat(['BTC', 'BCH'], _.difference(arr, ['BTC', 'BCH']));
                    },
                },
                methods: {
                    submit(){
                        if(!_.has(markets.data[options.price.coin],options.price.badge.source)){
                            options.price.badge.source=Object.keys(markets.data[options.price.coin])[0]
                        }
                        return storage.set({
                            options: this.options
                        });
                    }
                },
                ready() {
                     if(!_.has(markets.data[options.price.coin],options.price.badge.source)){
                         options.price.badge.source=Object.keys(markets.data[options.price.coin])[0]
                         return storage.set({
                             options: this.options
                         });
                     }
                }
            });
        });
});