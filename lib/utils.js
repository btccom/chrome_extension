const config = require('../config');
const constants = require('./constants');
const storage = require('./storage');

module.exports = {
    getPriceBackgroundColor(mode, change){
        if (mode == constants.RED_UP_GREEN_DOWN) {
            return change > 0 ? config.colors.RED : change < 0 ? config.colors.GREEN : config.colors.RED;
        } else {
            return change > 0 ? config.colors.GREEN : change < 0 ? config.colors.RED : config.colors.GREEN;
        }
    },

    convertCurrency(rates, fromSymbol, toSymbol, value){
        if (fromSymbol.toUpperCase() == toSymbol.toUpperCase()) return value;
        return value * (rates[`${fromSymbol.toUpperCase()}2${toSymbol.toUpperCase()}`])
    },

    getLocale() {
        let locale = chrome.i18n.getUILanguage();
        return locale == 'zh-CN' ? 'zh_cn' : 'en';
    }
};