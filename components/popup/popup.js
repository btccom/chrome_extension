require('../../lib/bootstrap');
require('./popup.less');

const _ = require('lodash');
const Vue = require('vue');
const moment = require('moment');
const constants = require('../../lib/constants');
const config = require('../../config');
const utils = require('../../lib/utils');
const storage = require('../../lib/storage');

Vue.filter('numberFormat', (number, decimals, decPoint, thousandsSep) => {
    decimals = isNaN(decimals) ? 2 : Math.abs(decimals);
    decPoint = (decPoint === undefined) ? '.' : decPoint;
    thousandsSep = (thousandsSep === undefined) ? ',' : thousandsSep;

    var sign = number < 0 ? '-' : '';
    number = Math.abs(+number || 0);

    var intPart = parseInt(number.toFixed(decimals), 10) + '';
    var j = intPart.length > 3 ? intPart.length % 3 : 0;

    return sign + (j ? intPart.substr(0, j) + thousandsSep : '') + intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousandsSep) + (decimals ? decPoint + Math.abs(number - intPart).toFixed(decimals).slice(2) : '');
});

Vue.filter('timestampFormat', (v, format = 'YYYY/MM/DD HH:mm:ss') => {
    return moment(v * 1000).format(format);
});

Vue.filter('sortName', (v, opt) => {
    if (opt) {
        var data = v[opt];
        var sort_data = {};
        if (data && data.binance) {
            sort_data['binance'] = data.binance;
            Object.keys(data).map(key => {
                if (key != 'binance') {
                    sort_data[key] = data[key];
                }
            })
            return sort_data;
        }

        return data;
    }
});

const priceIndicator = {
    props: ['v', 'rates', 'symbol', 'options'],
    filters: {},
    data() {
        return {
            change: 0
        }
    },
    template: `
<div class="price-indicator" v-el:container>
    <i class="glyphicon glyphicon-arrow-up" v-show="change > 0"></i>
    <i class="glyphicon glyphicon-arrow-right" v-show="change == 0"></i>
    <i class="glyphicon glyphicon-arrow-down" v-show="change < 0"></i>
    {{ options.price.preferCurrency == 'USD' ? '¥' : '$' }} {{ convert(v, symbol.currency, options.price.preferCurrency == 'USD' ? 'CNY' : 'USD') | numberFormat 2 }}
     /
    {{ options.price.preferCurrency == 'USD' ? '$' : '¥' }} {{ convert(v, symbol.currency, options.price.preferCurrency) | numberFormat 2 }}
</div>
`,
    methods: {
        convert(value, fromSymbol, toSymbol){
            if (fromSymbol.toUpperCase() == toSymbol.toUpperCase()) return value;
            return value * (this.rates[`${fromSymbol.toUpperCase()}2${toSymbol.toUpperCase()}`])
        }
    },
    ready(){
        const container = this.$els.container;

        container.addEventListener('animationend', function animate() {
            container.classList.remove('active-green');
            container.classList.remove('active-red');
        }, false);
    },
    watch: {
        v(nv, ov) {
            // console.log('nv = %d, ov = %d', nv, ov);
            if (ov == null) {
                this.change = 0;
            } else {
                this.change = nv - ov;
            }

            // 添加 active 类
            let color;
            if (this.change > 0 && this.options.price.changeColor == constants.RED_UP_GREEN_DOWN) color = 'red';
            else if (this.change > 0 && this.options.price.changeColor == constants.RED_DOWN_GREEN_UP) color = 'green';
            else if (this.change < 0 && this.options.price.changeColor == constants.RED_UP_GREEN_DOWN) color = 'green';
            else if (this.change < 0 && this.options.price.changeColor == constants.RED_DOWN_GREEN_UP) color = 'red';

            color && this.$els.container.classList.add('active-' + color);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    new Vue({
        el: '.container',
        data: {
            markets: {
                data: {},
                updatedAt: 0
            },
            symbols: [],
            rates: {},
            options: {price: {}},
            needUpdate: false,
            latestVersion: {
                version: ''
            },
            submitURL: `https://chain.btc.com/${utils.getLocale().replace('_', '-')}/search`
        },

        computed: {
            coins: function () {
                var arr = Object.keys(this.markets.data);
                return _.concat(['BTC', 'BCH'], _.difference(arr, ['BTC', 'BCH'])).reverse();
            },
        },

        filters: {
            exchangeName(symbol) {
                return symbol.display_name;
            }
        },
        components: {
            priceIndicator
        },
        methods: {
            convert(value, fromSymbol, toSymbol){
                if (fromSymbol.toUpperCase() == toSymbol.toUpperCase()) return value;
                return value * (this.rates[`${fromSymbol.toUpperCase()}2${toSymbol.toUpperCase()}`])
            }
        },
        ready() {
            chrome.storage.onChanged.addListener(changes => {
                if (changes.markets) {
                    // console.log('new markets', changes.markets.newValue.data);
                    _.extend(this.markets, changes.markets.newValue);
                }
            });

            return Promise.join(storage.getMarkets(), storage.getSymbolAndRates(), storage.getOptions())
                .then(([markets, {symbols, rates}, options]) => {
                    this.markets = markets;
                    this.symbols = symbols;
                    this.rates = rates;
                    this.options = options;
                });
        }
    });
});