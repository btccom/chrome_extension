const superAgent = require('superagent-bluebird-promise');
const moment = require('moment');
const config = require('../config');
const utils = require('./utils');

module.exports = {
    get(keys){
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, function (items) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }

                // console.debug('storage get', keys, items);

                return resolve(items);
            });
        });
    },

    set(keys){
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(keys, function () {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }

                // console.debug('storage set', keys);

                return resolve(keys);
            });
        });
    },

    updateSymbolAndRates(){
        return Promise.props({
            symbolResponse: superAgent.get(config.marketsAPIEndpoint),
            ratesResponse: superAgent.get(config.ratesAPIEndpoint)
        })
            .then(({symbolResponse, ratesResponse}) => {
                let result = JSON.parse(symbolResponse.text);
                let symbols = result.symbols,
                    rates = ratesResponse.body.data;

                return this.set({symbols, rates, symbolsUpdatedAt: moment().unix()})
                    .return({symbols, rates});
            })
            .catch(error => {
                return this.get(['rates', 'symbols', 'symbolsUpdatedAt'])
                    .return({symbols, rates});

                console.log(error.message);
            })
    },

    getSymbolAndRates(){
        return this.get(['rates', 'symbols', 'symbolsUpdatedAt'])
            .then(result => {
                if (result.rates == null || result.symbols == null || result.symbolsUpdatedAt == null ||
                    moment().unix() - result.symbolsUpdatedAt >= 1000) {
                    return this.updateSymbolAndRates();
                }

                return result;
            });
    },

    getOptions(path = null, defaultValue = null){
        return this.get('options')
            .then(result => {

                const locale = require('./utils').getLocale();
                const options = config.defaultConfig[locale];

                if (result.options == null) {
                    return this.set({options}).return(options);
                }
                else {
                    return result.options;
                }
            })
            .then(options => {
                if (path == null) return options;
                return _.get(options, path, defaultValue);
            });
    },

    getMarkets(){
        return this.get('markets')
            .then(result => {
                if (result.markets == null) {
                    return [];
                }

                return result.markets;
            });
    },
};