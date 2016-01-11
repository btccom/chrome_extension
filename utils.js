const config = require('./config');

module.exports = {
    getPriceBackgroundColor(mode, change){
        if (mode == 'RED_UP_GREEN_DOWN') {
            return change > 0 ? config.colors.RED : change < 0 ? config.colors.GREEN : config.colors.GRAY;
        } else {
            return change > 0 ? config.colors.GREEN : change < 0 ? config.colors.RED : config.colors.GRAY;
        }
    }
};