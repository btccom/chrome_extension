require('./option.less');
require('../../lib/bootstrap');
const _ = require('lodash');
const Vue = require('vue');
const utils = require('../../lib/utils');
const storage = require('../../lib/storage');

Promise.join(storage.getOptions(), storage.getSymbolAndRates())
    .then(([options, { symbols }]) => {
        new Vue({
            el: '.settings',
            data: {
                options,
                symbols
            },
            filters: {
                exchangeName(symbol) {
                    return symbol[`platform_${utils.getLocale()}`];
                }
            },
            methods: {
                submit(){
                    return storage.set({
                        options: this.options
                    });
                }
            }
        });
    });