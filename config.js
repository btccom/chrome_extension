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
    autoUpdateEndpoint: 'http://static.btc.com/chrome-ext/LATEST',
    blockAPIEndpoint: 'https://api.chain.btc.com/v1',
    marketsAPIEndpoint: 'http://www.bitmain.com:9000',
    websocketEndpoint: 'http://www.bitmain.com:8080',

    colors: {
        RED: [241, 79, 90, 255],
        GREEN: [25, 197, 95, 255],
        GRAY: [77, 77, 77, 255]
    },
    defaultConfig: {
        'zh_cn': _.merge({}, defaultConfig, {
            price: {
                badge: {
                    source: 'huobibtccny'
                },
                changeColor: constants.RED_UP_GREEN_DOWN,
                preferCurrency: constants.CNY
            }
        }),
        'en': _.merge({}, defaultConfig, {
            price: {
                badge: {
                    source: 'coinbasebtcusd'
                },
                changeColor: constants.RED_DOWN_GREEN_UP,
                preferCurrency: constants.USD
            }
        })
    }
};