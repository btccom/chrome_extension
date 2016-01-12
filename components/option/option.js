require('./option.less');
require('../../lib/bootstrap');
const _ = require('lodash');
const Vue = require('vue');
const storage = require('../../lib/storage');

Promise.join(storage.getOptions(), storage.getSymbolAndRates())
    .then(([options, { symbols }]) => {
        new Vue({
            el: '.settings',
            data: {
                options,
                symbols
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