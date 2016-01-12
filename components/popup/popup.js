require('./popup.less');
require('../../lib/bootstrap');

const _ = require('lodash');
const Vue = require('vue');
const constants = require('../../lib/constants');
const config = require('../../config');
const utils = require('../../lib/utils');
const storage = require('../../lib/storage');

Vue.filter('format', (v, size, withSign) => {
    if (withSign == null) withSign = false;
    var num = v.toFixed(size);
    if (withSign && v >= 0) num = '+' + num;
    return num;
});

const priceIndicator = {
    props: ['v', 'rates', 'symbol', 'options'],
    filters: {

    },
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
    {{ options.price.preferCurrency == 'USD' ? '$' : '¥' }} {{ convert(v / 1e3, symbol.currency_type, options.price.preferCurrency) | format 2 }}
    /
    {{ options.price.preferCurrency == 'USD' ? '¥' : '$' }} {{ convert(v / 1e3, symbol.currency_type, options.price.preferCurrency == 'USD' ? 'CNY' : 'USD') | format 2 }}
</div>
`,
    methods: {
        convert(value, fromSymbol, toSymbol){
            return this.rates[toSymbol] / this.rates[fromSymbol] * value;
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
            console.log('nv = %d, ov = %d', nv, ov);
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

new Vue({
    el: '.markets',
    data: {
        markets: {},
        symbols: [],
        rates: {},
        options: {}
    },
    filter: {

    },
    components: {
        priceIndicator
    },
    methods: {
    },
    ready() {
        chrome.storage.onChanged.addListener(changes => {
            if (changes.markets) {
                console.log('new markets', changes.markets.newValue.data);
                _.extend(this.markets, changes.markets.newValue.data);
            }
        });

        return Promise.join(storage.getMarkets(), storage.getSymbolAndRates(), storage.getOptions())
            .then(([ markets, { symbols, rates }, options ]) => {
                this.markets = markets.data;
                this.symbols = symbols;
                this.rates = rates;
                this.options = options;
            });
    }
});