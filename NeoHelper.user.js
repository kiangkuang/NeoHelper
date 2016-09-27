// ==UserScript==
// @name         NeoHelper
// @namespace    https://github.com/kiangkuang
// @version      0.5.1
// @author       Kiang Kuang
// @description  Helps you to buy stocks daily, visit Clotzan's Shrine daily, visit Trudy's Surprise daily, play Potato Counter, take items from Money Tree
// @homepage     https://github.com/kiangkuang/NeoHelper
// @supportURL   https://github.com/kiangkuang/NeoHelper/issues
// @updateURL    https://github.com/kiangkuang/NeoHelper/raw/master/NeoHelper.user.js
// @downloadURL  https://github.com/kiangkuang/NeoHelper/raw/master/NeoHelper.user.js
// @include      *
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.1/moment.min.js
// @connect      neopets.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @noframes
// ==/UserScript==

(function() {
    "use strict";

    var config = {
        buyStocks: true,
        minPrice: 15,
        maxPrice: 17,
        stocksAmount: 1000,
        visitShrine: true,
        trudysSurprise: true,
        potatoCounter: true,
        moneyTree: true,
    };

    var nst = moment().utcOffset(-7);

    if (config.buyStocks) {
        if (moment(GM_getValue('boughtStocks', 0)).utcOffset(-7).isBefore(nst, 'day') && !GM_getValue('buyingStocks', false)) {
            GM_setValue('buyingStocks', true);
            goToStocks();
            return;
        }
        if (document.URL.indexOf('/stockmarket.phtml?type=buy&ticker=') > -1 && GM_getValue('buyingStocks', false)) {
            GM_setValue('buyingStocks', false);
            GM_setValue('boughtStocks', moment().utcOffset(-7).format());
            buyStocks();
            return;
        }
    }

    if (config.visitShrine) {
        if (moment(GM_getValue('clickedShrine', 0)).utcOffset(-7).isBefore(nst, 'day') && !GM_getValue('clickingShrine', false)) {
            GM_setValue('clickingShrine', true);
            GM_openInTab('http://www.neopets.com/desert/shrine.phtml', true);
            return;
        }
        if (window.location.pathname == '/desert/shrine.phtml' && GM_getValue('clickingShrine', false)) {
            GM_setValue('clickingShrine', false);
            GM_setValue('clickedShrine', moment().utcOffset(-7).format());
            $('.content form:nth-child(3)').submit();
            return;
        }
    }

    if (config.trudysSurprise) {
        if (moment(GM_getValue('trudysSurprise', 0)).utcOffset(-7).isBefore(nst, 'day')) {
            GM_setValue('trudysSurprise', moment().utcOffset(-7).format());
            GM_openInTab('http://www.neopets.com/trudys_surprise.phtml', true);
            return;
        }
    }

    if (config.potatoCounter) {
        if (window.location.pathname == '/medieval/potatocounter.phtml') {
            if ($('.content input[name="guess"]').length) {
                $('.content input[name="guess"]').val($('.content table img').length);
                $('.content form').submit();
            }
            return;
        }
    }

    if (config.moneyTree) {
        if (window.location.pathname == '/donations.phtml') {
            window.location.href = $('.content tr:last-child td:last-child div a').attr('href');
            return;
        }
        if (window.location.pathname == '/takedonation_new.phtml') {
            window.location.href = '/donations.phtml';
            return;
        }
    }

    function goToStocks() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://www.neopets.com/stockmarket.phtml?type=list&full=true",
            onload: function(response) {
                var result = $.parseHTML(response.responseText);

                if ($(result).find('.welcomeContent').length === 0) {
                    for (var price = config.minPrice; price <= config.maxPrice; price++) {
                        var company = $($(result).find('.content td:nth-child(6):contains(' + price + ')').siblings()[1]).find('a').text();
                        if (company) {
                            GM_setValue('stockPrice', price);
                            GM_openInTab("http://www.neopets.com/stockmarket.phtml?type=buy&ticker=" + company, true);
                            return;
                        }
                    }
                    GM_setValue('buyingStocks', false);
                    GM_setValue('boughtStocks', moment().utcOffset(-7).format());
                    console.error("NeoHelper: No stocks within price range to buy!");
                } else {
                    console.error("NeoHelper: Not logged in!");
                }
            }
        });
    }

    function buyStocks() {
        var amt = Math.min(config.stocksAmount, Math.floor(parseInt($("#npanchor").text().replace(/,/g, '')) / GM_getValue('stockPrice')));
        $('.content input[name="amount_shares"]').val(amt);

        if (amt < config.stocksAmount) {
            alert("Not enough NP for " + config.stocksAmount + " shares!");
            return;
        }

        $('.content form').submit();
    }

    function reset() {
        GM_deleteValue('boughtStocks');
        GM_deleteValue('buyingStocks');
        GM_deleteValue('clickedShrine');
        GM_deleteValue('clickingShrine');
        GM_deleteValue('stockPrice');
        GM_deleteValue('trudysSurprise');
    }

    // reset();
})();