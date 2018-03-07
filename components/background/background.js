require('../../lib/bootstrap');
require('./context_menu');

const io = require('socket.io-client');
const moment = require('moment');
const _ = require('lodash');
const storage = require('../../lib/storage');
const utils = require('../../lib/utils');
const config = require('../../config');

// 使用 websocket 连接
const socket = new io(config.websocketEndpoint);

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


var index=0;
storage.get('markets').then(items => {
    let markets = items.markets;

    if (markets == null) {
        markets = {
            data: null,
            updatedAt: null
        };
    }

    socket.on('all_symbol_tick', function (data) {

        // 每6000秒 刷新本地缓存数据
        index++;
        if(index==1 || index==4000){
            markets={}
        }

        let last_data = {}; //最新数据

        Object.keys(data).forEach(key => {

            let coin_list = {};

            Object.values(data[key]).forEach(info => {
                if (info && info.status == 1) {  //正常状态的数据

                    info.cointype == 'bcc' ? info.cointype = 'bch' : null;  //bcc 统一成bch
                    let currency = info.symbol.split('_')[1];
                    info['currency'] = currency == 'usdt' ? 'USD' : currency.toUpperCase();

                    delete info['market_code'];
                    delete info['timestamp'];
                    delete info['httptime'];
                    delete info['message'];
                    delete info['buy'];
                    delete info['sell'];

                    //增量更新
                    if (markets.data) {
                        if (!_.isEqual(markets.data[key.toUpperCase()][info.market], info)) {
                            coin_list[info.market] = info;
                        }
                    } else {
                        coin_list[info.market] = info;
                    }

                }
            });

            last_data[key.toUpperCase()] = coin_list;
        })

        console.log('websocket tick', last_data);

        _.merge(markets, {
            data: last_data,
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

                var select_coin_exchange = {}; //角标选中的交易所币种
                if (changes.markets) {
                    if (_.has(changes.markets.newValue.data[opt.price.coin], opt.price.badge.source)) {
                        select_coin_exchange = changes.markets.newValue.data[opt.price.coin][opt.price.badge.source];
                    } else {

                        //没找到交易所列表没有时默认第一个
                        opt.price.badge.source = Object.keys(changes.markets.newValue.data[opt.price.coin])[0];
                        select_coin_exchange = changes.markets.newValue.data[opt.price.coin][opt.price.badge.source];
                        storage.set({
                            options: opt
                        });
                    }

                }
                else {
                    select_coin_exchange = markets.data[opt.price.coin][opt.price.badge.source];
                }
                if (!select_coin_exchange && !changes.markets) return;

                var last = select_coin_exchange.last;
                var open=0;
                if(_.has(changes,'markets')){
                     open = changes.markets.oldValue.data[opt.price.coin][opt.price.badge.source].last;
                }else{
                     open = markets.data[opt.price.coin][opt.price.badge.source].last;
                }


                return storage.getSymbolAndRates()
                    .then(({symbols, rates}) => {
                        return utils.convertCurrency(
                            rates,
                            select_coin_exchange.currency,
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