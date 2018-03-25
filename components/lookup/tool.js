/**
 ** Created by wen on 15/12/4.
 */

/*用途：自动返回中英文字符*/
var lng;
var floatnum=parseFloat(Math.pow(10,8));
function dicbook(field){
    var zn={
        "block":"块详情",
        "address": "地址详情",
        "tx":"交易详情",
        "height": "高度",
        "confirm": " 确认数",
        "size": "大小",
        "txcount": "交易数量",
        "time": "时间",
        "Relayed": "播报方",
        "Balance": "余额",
        "total_received": "总接收",
        "fee":"矿工费",
        "timestamp": "时间",
        "past_month_tx_count":"最近30天交易数量",
        "first_tx_timestamp":"初次交易时间",
        "unconfirmed":"未确认",
        "Orphaned block":"(孤块)",
        "ErrorOne":"未找到符合查询的数据",
        "ErrorTwo":"更多数据请访问",
        "Impression":"印象",
        "strip":"条",
        "Impress":"",
        "reward":"块奖励",
    }
    var en={
        "block":"Block Info",
        "address":"Address Info",
        "tx":"Transaction Info",
        "height":"Height",
        "confirm": "Confirm",
        "size": "Size",
        "txcount": "Tx Count",
        "time": "Time",
        "Relayed": "Relayed By",
        "Balance": "Balance",
        "total_received": "Total Received",
        "fee":"Fee",
        "timestamp": "Time",
        "past_month_tx_count":"Tx Count of Last 30 Days",
        "first_tx_timestamp":"First Tx Time",
        "unconfirmed":"Unconfirmed",
        "Orphaned block":"(Orphaned Block)",
        "ErrorOne":"Your search didn't match any records.",
        "ErrorTwo":"If necessary, please visit <a href='https://chain.btc.com' target='_blank'>www.btc.com</a>",
        "Impression":"Impression",
        "strip":"条",
        "Impress":"",
        "reward":"Reward",
    }
    var lang = navigator.language || navigator.userLanguage;
    if(lang.substr(0, 3) == "zh-") {
        lng="zn"
        return zn[field];
    }else{
        lng="en"
        return en[field];
    }
}
/*关闭面板*/
function lookover(){
    if(oDiv){
        //if(window.event.target.contains(targetElement)){return;}
        if(window.event.target===targetElement){return;}
        if(window.event.target.id=="oDiv_top"){return;}
        $("#oDiv").hide(700);
    }
}
/*千分位数据格式化*/
function formatnum(num) {
    return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
}
/*通过 document.selection.empty() 来清除选中的内容。*/
var clearSlct= "getSelection" in window ? function(){
    window.getSelection().removeAllRanges();
} : function(){
    document.selection.empty();
};

/*
 用途：时间戳怎么转成日期格式
 */
function localTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
}
/*
用途：最终匹配worth 的值是哪种类型(address,block,Tx)
如果通过验证返回该值类型,否则返回false
*/
function looktype(){
   if(isBlock()){
       type="block";
   } else {
       if (isTx()) {
           type = "tx";
       } else {
           if (isAddress()) {
               type = "address";
           } else {
               return;
           }
       }
   }
        if(type=="block"){element = {"btc_height": "", "btc_confirm": "", "btc_time": "", "btc_size": "", "btc_txcount": "", "btc_Relayed": ""};}
        if(type=="address"){element = {"btc_Balance": "", "btc_total_received": "", "btc_txcount": "","btc_past_month_tx_count": "","btc_first_tx_timestamp": "","btc_Impress":""};}
        if(type=="tx"){element = {"btc_timestamp":"","btc_confirm":"","btc_size":"","btc_fee":"","btc_height":""};}

   return true;
}
/*
用途：检查输入字符串是否一个address类型
如果通过验证返回true,否则返回false
*/
function isAddress(){
    //var fg=require('bitcore').Address.isValid(worth);
    if (require('bitcore').Address.isValid(worth)){
        return true;
    }else {
        return false;
    }
}
/*
 用途：检查输入字符串是否一个block类型
 如果通过验证返回true,否则返回false
 */
function isBlock(){
    var regu = "^[0]{8}[0-9a-f]{56}$";
    var re = new RegExp(regu);
    if (re.test(worth)){
        return true;
    }else {
        return false;
    }
}
/*
 用途：检查输入字符串是否一个block类型
 如果通过验证返回true,否则返回false
 */
function isTx(){
    var regu = "^[0-9a-fA-F]{64}$";
    var re = new RegExp(regu);
    if (re.test(worth)){
        return true;
    }else {
        return false;
    }
}
