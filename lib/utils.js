const config = require('../config');
const constants = require('./constants');
const storage = require('./storage');

module.exports = {
    getPriceBackgroundColor(mode, change){
        if (mode == constants.RED_UP_GREEN_DOWN) {
            return change > 0 ? config.colors.RED : change < 0 ? config.colors.GREEN : config.colors.GRAY;
        } else {
            return change > 0 ? config.colors.GREEN : change < 0 ? config.colors.RED : config.colors.GRAY;
        }
    },

    convertCurrency(fromSymbol, toSymbol, value){
        if (fromSymbol == toSymbol) return Promise.resolve(value);

        return storage.getSymbolAndRates()
            .then(({ rates }) => {
                return value * (rates[toSymbol] / rates[fromSymbol]);
            });
    }
};