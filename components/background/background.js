require('../../lib/bootstrap');
require('./context_menu');

const io = require('socket.io-client');
const moment = require('moment');
const _ = require('lodash');
const storage = require('../../lib/storage');
const utils = require('../../lib/utils');
const config = require('../../config');

// 使用 websocket 连接
const socket = io(config.websocketEndpoint, {
    path: config.websocketPath
});

// 连接失败
socket.on('connect_error', e => {
    console.warn(`connect error`, e);
});

// 重新连接成功
socket.on('reconnect', n => {
    console.log(`reconnected, ${n}`);
});

// 正在重连
socket.on('reconnecting', n => {
    console.log(`reconnecting, ${n}`);
});

// 重新连接失败
socket.on('reconnect_error', e => {
    console.warn(`reconnect error`, e);
});

// 所有的重试均已失败
socket.on('reconnect_failed', () => {
    console.error('reconnect_failed');
});

storage.get('markets').then(items => {
    let markets = items.markets;

    if (markets == null) {
        markets = {
            data: null,
            updatedAt: null
        };
    }

    socket.on('snapshot', function (data) {
        console.log('snapshot last', data);
        markets = {
            data,
            updatedAt: moment().unix()
        };
        storage.set({markets});
    });



    socket.on('last', function (data) {
        console.log('websocket last', data);

        _.merge(markets, {
            data,
            updatedAt: moment().unix()
        });
        storage.set({markets});
    });
});

chrome.storage.onChanged.addListener(changes => {
    if (changes.markets || changes.options) {
        Promise.join(storage.getOptions(), storage.getMarkets())
            .then(([opt, markets]) => {
                if (!opt.price.badge.enable) {
                    chrome.browserAction.setBadgeText({
                        text: ''
                    });
                    return;
                }

                var info;
                if (changes.markets) {
                    if(_.has(changes.markets.newValue.data,opt.price.badge.source)){
                        info = changes.markets.newValue.data[opt.price.badge.source];
                    }else{

                        //bch 默认 krakenbtcusd, btc 的交易所列表没有时默认第一个
                        opt.price.badge.source= opt.price.coin=='BCH' ? 'krakenbtcusd' : Object.keys(changes.markets.newValue.data)[0];
                        info = changes.markets.newValue.data[opt.price.badge.source];
                        storage.set({
                            options: opt
                        });
                    }

                }
                else {
                    info = markets.data[opt.price.badge.source];
                }
                if (!info) return;

                const last = info.last;
                const open = info.open ? info.open : 0;

                return storage.getSymbolAndRates()
                    .then(({symbols, rates}) => {
                        return utils.convertCurrency(
                            rates,
                            _.find(symbols, e => e.symbol == opt.price.badge.source).currency_type,
                            opt.price.preferCurrency,
                            last
                        );
                    })
                    .then(convertedLast => {
                        // 设置角标
                        let lastPrice = Math.floor(convertedLast).toFixed(0);
                        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                        const lengthLimit = isMac ? 3 : 4;
                        const overflow = lastPrice.length > lengthLimit;

                        if (overflow) {     // 转为 {number.number}K 格式
                            lastPrice = parseFloat(lastPrice / 1000).toString().slice(0, 3);
                            if (lastPrice[lastPrice.length - 1] === '.') {
                                lastPrice = lastPrice.slice(0, -1);
                            }
                            lastPrice += 'K';
                        }

                        chrome.browserAction.setBadgeText({
                            text: lastPrice
                        });

                        // 设置背景色
                        chrome.browserAction.setBadgeBackgroundColor({
                            color: utils.getPriceBackgroundColor(opt.price.changeColor, last - open)
                        });
                    });
            });
    }
});