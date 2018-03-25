require('./option.less');
require('../../lib/bootstrap');
const _ = require('lodash');
const Vue = require('vue');
const utils = require('../../lib/utils');
const storage = require('../../lib/storage');

window.addEventListener('DOMContentLoaded', () => {
    Promise.join(storage.getOptions(), storage.getSymbolAndRates())
        .then(([options, { symbols }]) => {
            new Vue({
                el: '.settings',
                data: {
                    options,
                    symbols
                },
                computed:{
                   coinSymbols(){
                       return this.symbols.filter(s=>s.coin_type==this.options.price.coin);
                   }
                },
                filters: {
                    exchangeName(symbol) {
                        return symbol.display_name;
                    }
                },
                methods: {
                    submit(){
                        let items=[];
                        this.coinSymbols.map(s=>items.push(s.symbol));
                        items.indexOf(this.options.price.badge.source)<0 ? this.options.price.badge.source=items[0] : null;
                        return storage.set({
                            options: this.options
                        });
                    }
                },
                ready() {
                    let items=[];
                    this.coinSymbols.map(s=>items.push(s.symbol));
                    items.indexOf(this.options.price.badge.source)<0 ? this.options.price.badge.source=items[0] : null;
                    return storage.set({
                        options: this.options
                    });
                }
            });
        });
});