const _ = require('lodash');
const constants = require('./lib/constants');

const defaultConfig = {
    query: {
        dropdown: {
            enable: true
        }
    },
    price: {
        badge: {
            enable: true,
            source: undefined
        },
        changeColor: undefined,
        preferCurrency: undefined
    }
};

module.exports = {
    autoUpdateEndpoint: 'http://s.btc.com/chrome-ext/LATEST',
    blockAPIEndpoint: 'https://api.chain.btc.com/v1',
    ratesAPIEndpoint: 'https://btcapp.api.btc.com/v1/exchange-rate?rate=usd2cny,cny2usd,cny2eur,eur2cny,usd2eur,eur2usd',
    websocketPath: '/v4/socket.io',
    marketsAPIEndpoint: 'http://price-chr.api.btc.com/api/symbol',
    websocketEndpoint: 'ws://price-chr.api.btc.com',
    // marketsAPIEndpoint: 'http://localhost:10005/v4',
    // websocketEndpoint: 'http://localhost:10005',



    colors: {
        RED: [241, 79, 90, 255],
        GREEN: [25, 197, 95, 255],
        GRAY: [77, 77, 77, 255]
    },
    sort:{

    },
    defaultConfig: {
        'zh_cn': _.merge({}, defaultConfig, {
            price: {
                coin:'BTC',
                badge: {
                    source: 'binance'
                },
                changeColor: constants.RED_UP_GREEN_DOWN,
                preferCurrency: constants.CNY
            }
        }),
        'en': _.merge({}, defaultConfig, {
            price: {
                coin:'BTC',
                badge: {
                    source: 'binance'
                },
                changeColor: constants.RED_DOWN_GREEN_UP,
                preferCurrency: constants.USD
            }
        })
    }
};
