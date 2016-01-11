const io = require('socket.io-client');
const moment = require('moment');
const _ = require('lodash');
const $ = require('jquery');
const utils = require('./utils');
const config = require('./config');

// 生成默认配置
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason == 'install') {  //初次安装时,生成默认配置
        chrome.storage.local.set({
            options: {
                queryDropdown: true,
                priceBadge: {
                    enable: true,
                    sourceSymbol: 'huobibtccny'
                },
                priceChangeColor: 'RED_UP_GREEN_DOWN'
            }
        });
    }

    $.when($.getJSON(config.marketsAPIEndpoint + '/symbol'),
        $.getJSON(config.marketsAPIEndpoint + '/ticker/rates'))
        .then((symbolResponse, ratesResponse) => {
            console.log('symbols', symbolResponse[0].data.symbols);
            console.log('rates', ratesResponse[0].rates);
            chrome.storage.local.set({
                symbols: symbolResponse[0].data.symbols,
                rates: ratesResponse[0].rates
            });
        });

    chrome.alarms.create('updateSymbol', {
        delayInMinutes: 0,
        periodInMinutes: 10
    });
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name == 'updateSymbol') {
        $.getJSON(config.marketsAPIEndpoint + '/symbol')
            .then(response => {
                console.log('symbols', response.data);
                chrome.storage.local.set(response.data);
            });
    }
});


const socket = io(config.websocketEndpoint, {
    reconnection: true,
    timeout: 2000
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

let markets = null;

chrome.storage.local.get('markets', function(items) {
    markets = items.markets;

    if (markets == null) {
        markets = {
            data: null,
            updatedAt: null
        };
    }

    socket.on('snapshot', function(data) {
        console.log('websocket snapshot', data);

        markets = {
            data,
            updatedAt: moment().unix()
        };
        chrome.storage.local.set({markets});
    });

    socket.on('last', function(data) {
        console.log('websocket last', data);

        _.merge(markets, {
            data,
            updatedAt: moment().unix()
        });
        chrome.storage.local.set({markets});
    });
});

chrome.storage.onChanged.addListener(changes => {
    if (changes.markets) {
        chrome.storage.local.get('options', items => {
            const opt = items.options;
            if (!opt.priceBadge.enable) {
                chrome.browserAction.setBadgeText({
                    text: ''
                });
                return;
            }

            const info = changes.markets.newValue.data[opt.priceBadge.sourceSymbol];
            if (!info) return;

            const last = info.last;
            chrome.browserAction.setBadgeText({
                text: Math.floor(last / 1e3).toFixed(0)
            });

            if (changes.markets.oldValue && changes.markets.oldValue.data[opt.priceBadge.sourceSymbol]) {
                const open = changes.markets.oldValue.data[opt.priceBadge.sourceSymbol].open;
                chrome.browserAction.setBadgeBackgroundColor({
                    color: utils.getPriceBackgroundColor(opt.priceChangeColor, last - open)
                });
            }
        });
    }
});