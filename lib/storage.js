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
            symbolResponse: superAgent.get(config.marketsAPIEndpoint + '/symbol'),
            ratesResponse: superAgent.get(config.ratesAPIEndpoint + '/ticker/rates')
        }).then(({symbolResponse, ratesResponse}) => {
            let json = JSON.parse(symbolResponse.text);
            let symbols = [],
                rates = ratesResponse.body.data.rates;

            json.symbols.forEach(symbol=>{
                if(config.defaultConfig.exchanges.indexOf(symbol.symbol)>=0){
                    symbols.push(symbol);
                }
            })


            return this.set({symbols, rates, symbolsUpdatedAt: moment().unix()})
                .return({symbols, rates});
        });
    },

    getSymbolAndRates(){
        return this.get(['rates', 'symbols', 'symbolsUpdatedAt'])
            .then(result => {
                if (result.rates == null || result.symbols == null || result.symbolsUpdatedAt == null ||
                    moment().unix() - result.symbolsUpdatedAt >= 3600) {
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
                    if (config.defaultConfig.exchanges.indexOf(result.options.price.badge.source) < 0) {
                        return this.set({options}).return(options);
                    }
                    else {
                        return result.options;
                    }
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

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};