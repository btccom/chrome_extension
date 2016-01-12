require('./popup.less');

require('../../lib/bootstrap');

const _ = require('lodash');

$(function() {
    chrome.storage.local.get('rates', ({ rates }) => {
        Vue.filter('CNY2USD', v => {
            return v * rates.USD;
        });

        Vue.filter('USD2CNY', v => {
            return v / rates.USD;
        });

        Vue.filter('format', (v, size, withSign) => {
            if (withSign == null) withSign = false;
            var num = v.toFixed(size);
            if (withSign && v >= 0) num = '+' + num;
            return num;
        });

        new Vue({
            el: '.markets',
            data: {
                markets: []
            },
            ready() {
                let symbols;

                chrome.storage.local.get(['markets', 'symbols'], items => {
                    symbols = items.symbols.filter(e => e.coin_type == 'BTC');
                    this.markets = symbols.map(e => {
                        let o = _.extend(items.markets.data[e.symbol], e, {
                            change: 0
                        });
                        if (o.currency_type == 'USD') {
                            o.open = Vue.filter('USD2CNY')(o.open);
                            o.last = Vue.filter('USD2CNY')(o.last);
                            o.high = Vue.filter('USD2CNY')(o.high);
                            o.low = Vue.filter('USD2CNY')(o.low);
                        }
                        return o;
                    });
                });

                chrome.storage.onChanged.addListener(changes => {
                    if (changes.markets) {
                        this.markets = symbols.map(e => {
                            let change = changes.markets.newValue.data[e.symbol].last - changes.markets.oldValue.data[e.symbol].last;
                            let o = _.extend(changes.markets.newValue.data[e.symbol], e, {
                                change: 0
                            });
                            if (o.currency_type == 'USD') {
                                o.open = Vue.filter('USD2CNY')(o.open);
                                o.last = Vue.filter('USD2CNY')(o.last);
                                o.high = Vue.filter('USD2CNY')(o.high);
                                o.low = Vue.filter('USD2CNY')(o.low);
                            }

                            Vue.nextTick(() => {
                                o.change = change;
                            });

                            return o;
                        });
                    }
                });
            }
        });
    });
});