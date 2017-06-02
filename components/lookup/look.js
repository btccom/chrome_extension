const storage = require('../../lib/storage');

window.worth = window.type = window.oDiv = window.targetElement = window.element = null;
window.islink = false;

storage.getOptions('query.dropdown.enable')
    .then(isEnabled => {
        if (isEnabled) {

            document.body.addEventListener("click", isSelect, false);
            //document.body.addEventListener("mouseover", isLink, false);
            $("a").mouseover(function(){isLink();});

        }
    });

/*用途：判断是否移入A标签*/
function isLink() {
    if (window.event.srcElement.tagName == "A") {
        var preworth = worth;
        worth = window.event.srcElement.textContent.trim();
        if (looktype()) {
            clearSlct();//清除选中元素
            targetElement = window.event.target;
            islink = true;
            panel();
            $(targetElement).on('mouseleave', function() {
                if (islink) {
                    var x1 = $(oDiv).offset().left;//ODiv X1
                    var y1 = $(targetElement).offset().top;//targetElement y1
                    var mx = event.clientX + document.body.scrollLeft;//鼠标X
                    var my = event.clientY + document.body.scrollTop;//鼠标Y
                    if (my >= y1 && mx >= x1 && mx < (mx + 330)) {
                        return;
                    }
                    else {
                        $("#oDiv").hide(700);
                    }
                }
            })

        } else {
            worth = preworth;
            return false;
        }

    }
}

/*用途：判断是否选中*/
function isSelect() {
    if (window.getSelection) {
        var preworth = worth;
        worth = String(window.getSelection());
        worth = worth.replace(/^\s*/, "").replace(/\s*$/, "");
        if (worth == "") return;
        if (looktype()) {
            targetElement = window.event.target;
            islink = false;
            panel();
        } else {
            worth = preworth;
            return false;
        }
    }
}

/*用途：创建一个面板*/
function panel() {
    var pagewidth = document.body.clientWidth - event.clientX;
    var clientX = event.clientX + document.body.scrollLeft;
    var clientY = $(targetElement).offset().top + $(targetElement).height();
    if (oDiv) {
        oDiv.remove()
    }
    oDiv = document.createElement('div');
    oDiv.id = "oDiv";
    oDiv.classList.add('______btccom______');
    document.body.appendChild(oDiv);
    document.body.addEventListener("click", lookover, false);
    document.getElementById('oDiv').addEventListener('click', stopEvent, true);
    document.getElementById('oDiv').addEventListener('mouseleave', function() {
        if (islink) {
            $("#oDiv").hide(700);
        }
    }, false);
    var html = '<div id="oDiv_top" class="oDiv_top"></div>' +
        '<div class="oDiv_point"></div>' +
        '<div id="P_title">' +
        '<div id="typelink"><a class="typeinfo" href="https://btc.com/' + type + '/' + worth + '" target="_blank"><span class="typename">' + dicbook(type) + '</span><span class="sanjiao"></span></a></div>' +
        '<div id="close"></div>' +
        '</div>' +
        '<div class="topline"></div>' +
        '<div id="content_data">' +
        '<div id="loading"><div style="float:left;">loading</div><div class="load_point"></div></div>' +
        '<table id="datainfo" class="datainfo"></table>' +
        '</div>' +
        '<div class="oDivline"></div>' +
        '<a href="https://btc.com" target="_blank" class="btc_logo"></a>';
    $("#oDiv").append(html);
    // $("#oDiv_top").click(function(){targetElement.click();})
    for (var item in element) {
        var itemname = item.split("btc_")[1];
        var tr = '<tr>' +
            '<td class="td1" style="height:20px!important;font-size:13px!important;">' + dicbook(itemname) + '</td>' +
            '<td class="td2" style="height:20px!important;font-size:13px!important;"><div id=' + item + '></div></td>' +
            '</tr>'
        $("#datainfo").append(tr);
    }
    if (pagewidth < 270) {
        oDiv.style.right = 10 + 'px';// 指定创建的DIV在文档中距离左侧的位置
        //$('.oDiv_point').css("margin-left",310-pagewidth+"px");
    }
    else {
        oDiv.style.left = (clientX - 7) + 'px';// 指定创建的DIV在文档中距离左侧的位置
    }
    oDiv.style.top = (clientY +12) + 'px';// 指定创建的DIV在文档中距离顶部的位置
    getdata();
    //Drag("oDiv"); //拖动窗口
}

/*用途：http获取数据*/
function getdata() {
    var url = '';
    if (lng == "zn") {
        url = 'https://btcapp.api.BTC.com/v1/search/' + worth + '?user_lang=zh-cn';
    } else {
        url = 'https://btcapp.api.BTC.com/v1/search/' + worth + '?user_lang=en';
    }
    $.ajax({
        type: "get",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        url: url,
        beforeSend: function(xhr) {
            $("#loading").show();
        },
        success: function(data) {
            var result = data.data;
            if (data.error_no == "0") {
                if (result.type == "block") {//高度
                    var Orphaned = "";
                    if (result.data.chain_id != 0) {
                        Orphaned = dicbook("Orphaned");
                        if (lng == "zn") {//孤块
                            $("#datainfo").addClass("Orphaned");
                        } else {
                            $("#datainfo").addClass("Orphaned_en");
                        }
                    }
                    $("#btc_height").html("<a target='_blank' href='https://btc.com/block/" + result.data.height + "' >" + result.data.height + "" + Orphaned + "</a>");
                    $("#btc_confirm").text(result.data.confirm);
                    $("#btc_time").text(localTime(result.data.time));
                    $("#btc_size").text(formatnum(result.data.size) + " Bytes");
                    $("#btc_txcount").text(formatnum(result.data.n_tx));
                    if (result.data.relayed_by == "Unknown") {
                        $("#btc_Relayed").html(result.data.relayed_by)
                    }
                    else {
                        $("#btc_Relayed").html("<a target='_blank' href='https://btc.com/stats/pool/" + result.data.relayed_by + "'>" + result.data.relayed_by + "</a>");
                    }
                }
                if (result.type == "address") {//地址
                    $("#btc_Balance").text((parseFloat(result.data.final_balance) / floatnum).toFixed(8).toString() +' BTC');
                    $("#btc_total_received").text((parseFloat(result.data.total_received) / floatnum).toFixed(8).toString() +' BTC');
                    if (result.data.unconfirmed_tx_count == "0") {
                        $("#btc_txcount").text(result.data.n_tx)
                    }
                    else {
                        $("#btc_txcount").text(result.data.n_tx + "(" + result.data.unconfirmed_tx_count + " " + dicbook("unconfirmed") + ")")
                    }
                    ;
                    $("#btc_past_month_tx_count").text(result.data.past_month_tx_count);
                    $("#btc_first_tx_timestamp").html("<a target='_blank' href='https://btc.com/tx/" + result.data.first_tx_hash + "'>" + localTime(result.data.first_tx_timestamp) + "</a>");
                    if (result.data.n_tx == "0") {
                        $("#btc_past_month_tx_count").parent().parent().remove();
                        $("#btc_first_tx_timestamp").parent().parent().remove();
                    }
                    $("#btc_Impress").parent().prev().html("");
                    if (result.data.impressions_count == "0") {
                        $("#btc_Impress").parent().parent().remove();
                    }
                    else {
                        if (lng == "zn") {//印象
                            $("#btc_Impress").html("<a target='_blank' href='https://btc.com/address/" + result.data.address + "'>印象" + result.data.impressions_count + "条</a>");
                        } else {
                            $("#btc_Impress").html("<a target='_blank' href='https://btc.com/address/" + result.data.address + "'>" + result.data.impressions_count + " Impressions</a>");
                        }
                    }
                }
                if (result.type == "tx") {//交易
                    $("#btc_timestamp").text(localTime(result.data.timestamp));
                    $("#btc_confirm").html(result.data.confirm);
                    $("#btc_size").text(result.data.size +' Bytes');
                    $("#btc_fee").text((parseFloat(result.data.fee) / floatnum).toFixed(8).toString() +' BTC');
                    $("#btc_height").html("<a target='_blank' href='https://btc.com/block/" + result.data.height + "'>" + result.data.height + "</a>");
                    if (result.data.is_coinbase) { //coinbase 交易
                        $("#btc_fee").text(((result.data.block_rewards + parseFloat(result.data.fee)) / floatnum).toFixed(8).toString());
                        $("#btc_fee").parent().prev().html(dicbook("reward"));
                        $("#relayed_tr").remove();
                        var tr = '<tr id="relayed_tr">' +
                            '<td class="td1" style="height:20px!important;font-size:13px!important;">' + dicbook("Relayed") + '</td>';
                        if (result.data.relayed_by == "Unknown") {
                            tr += '<td class="td2" style="height:20px!important;font-size:13px!important;"><div id="Relayed">' + result.data.relayed_by + '</div></td></tr>';
                        }
                        else {
                            tr += '<td class="td2" style="height:20px!important;font-size:13px!important;"><div id="Relayed"><a target="_blank" href="https://btc.com/stats/pool/' + result.data.relayed_by + '">' + result.data.relayed_by + '</a></div></td></tr>';
                        }
                        $("#datainfo").append(tr);
                        if (lng == "zn") {
                            $("#datainfo").addClass("coinbase");
                        }
                        else {
                            $("#datainfo").addClass("coinbase_en");
                        }
                    }
                    if (result.data.confirm < 1) { //未确认交易
                        $("#btc_timestamp").text("-");
                        if (lng == "zn") {
                            $("#datainfo").addClass("unconfirm");
                            $("#btc_confirm").html(`<a href='https://pushtx.btc.com/?txhash=${worth}' target="_blank">
                                                    <div class="btc-speed-up">
                                                        <span>0</span>
                                                        <span class="btc-speed-btn">交易加速</span>
                                                    </div>
                                               </a>`);
                        }
                        else {
                            $("#datainfo").addClass("unconfirm_en");
                            $("#btc_confirm").html(0);
                        }

                        $("#btc_height").text("-");
                    }
                }
            }
            else {
                $("#typelink").html("");
                $(".P_title").addClass("errortype");
                $(".topline").remove();
                $(".oDivline").remove();
                $(".btc_logo").remove();
                $("#content_data").html("<div class='error_info'><div>" + dicbook('ErrorOne') + "</div><div>" + dicbook('ErrorTwo') + "</div><a href='https://btc.com' target='_blank' class='btc_logo'></a></div>");
            }
        },
        timeout: 20000,
        complete: function(xhr) {
            $("#loading").remove();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            $("#typelink").html("");
            $(".P_title").addClass("errortype");
            $(".topline").remove();
            $(".oDivline").remove();
            $(".btc_logo").remove();
            $("#content_data").html("<div class='error_info'><div>" + dicbook('ErrorOne') + "</div><div>" + dicbook('ErrorTwo') + "</div><a href='https://btc.com' target='_blank' class='btc_logo'></a></div>");
        }
    });

}
/*用途：停止引发不该引发的click事件。*/
var stopEvent = function(event) {
    e = event || window.event;
    if (window.event.target.id == "close") {
        return;
    }
    else if (window.event.target.id == "oDiv_top") {
        return;
    }
    else if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
};