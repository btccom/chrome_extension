const superAgent = require('superagent-bluebird-promise');
const moment = require('moment');
const config = require('../config');
const utils = require('./utils');

module.exports = {
    get(keys){
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, function(items) {
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
            chrome.storage.local.set(keys, function() {
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
            symbolResponse: superAgent.get(config.marketsAPIEndpoint + '/symbol'),
            ratesResponse: superAgent.get(config.marketsAPIEndpoint + '/ticker/rates')
        }).then(({ symbolResponse, ratesResponse }) => {
            let symbols = symbolResponse.body.data.symbols.filter(s => s.coin_type == 'BTC'),
                rates = ratesResponse.body.data.rates;
            //console.log('latest symbols', symbols);
            //console.log('latest rates', rates);

            return this.set({ symbols, rates, symbolsUpdatedAt: moment().unix() })
                .return({ symbols, rates });
        });
    },

    getSymbolAndRates(){
        return this.get(['rates', 'symbols', 'symbolsUpdatedAt'])
                .then(result => {
                    if (result.rates == null || result.symbols == null || result.symbolsUpdatedAt == null ||
                        moment().unix() - result.symbolsUpdatedAt >= 3600*4) {
                        return this.updateSymbolAndRates();
                    }

                    return result;
                });
    },

    getOptions(path = null, defaultValue = null){
        return this.get('options')
            .then(result => {
                if (result.options == null) {
                    const locale = utils.getLocale();
                    const options = config.defaultConfig[locale];
                    return this.set({ options }).return(options);
                } else {
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

    latestVersion(){
        return superAgent.get(config.autoUpdateEndpoint)
            .query({
                k: Math.random()
            })
            .then(response => {
                return JSON.parse(response.text);
            });
    }
};