// ==UserScript==
// @name         NeoHelper
// @namespace    https://github.com/kiangkuang
// @version      0.4
// @description  Buys stocks, visit the shrine and trudy's surprise for you everyday
// @author       Kiang Kuang
// @include      *
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.1/moment.min.js
// @connect      neopets.com
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
    };

    var nst = moment().utcOffset(-7);

    if (config.buyStocks) {
        if (moment(GM_getValue('boughtStocks', 0)).isBefore(nst, 'day') && !GM_getValue('buyingStocks', false)) {
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
        if (moment(GM_getValue('clickedShrine', 0)).isBefore(nst, 'day') && !GM_getValue('clickingShrine', false)) {
            GM_setValue('clickingShrine', true);
            goToShrine();
            return;
        }
        if (window.location.pathname == '/desert/shrine.phtml' && GM_getValue('clickingShrine', false)) {
            GM_setValue('clickingShrine', false);
            GM_setValue('clickedShrine', moment().utcOffset(-7).format());
            clickShrine();
            return;
        }
    }

    if (config.trudysSurprise) {
        if (moment(GM_getValue('trudysSurprise', 0)).isBefore(nst, 'day')) {
            GM_setValue('trudysSurprise', moment().utcOffset(-7).format());
            goToTrudysSurprise();
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

    function goToShrine() {
        GM_openInTab('http://www.neopets.com/desert/shrine.phtml', true);
    }

    function clickShrine() {
        $('.content form:nth-child(3)').submit();
    }

    function goToTrudysSurprise() {
        GM_openInTab('http://www.neopets.com/trudys_surprise.phtml', true);
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

/* TODO
if (window.location.pathname == '/medieval/potatocounter.phtml') {
  //alert($('#content > table > tbody > tr > td.content > table > tbody > tr > td > img').length);
  $('#content > table > tbody > tr > td.content > center:nth-child(7) > form > input[type="text"]:nth-child(2)').val($('#content > table > tbody > tr > td.content > table > tbody > tr > td > img').length);
  $('#content > table > tbody > tr > td.content > center:nth-child(7) > form').submit();
}

if (window.location.pathname == '/donations.phtml') {
  window.location.href = $('#mt-content > table > tbody > tr:last-child > td:last-child > div > a').attr('href');
} else if (window.location.pathname == '/takedonation_new.phtml') {
  console.log(window.location.pathname);
  window.location.href = '/donations.phtml';
}
*/