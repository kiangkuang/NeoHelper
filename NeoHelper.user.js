// ==UserScript==
// @name         NeoHelper
// @namespace    https://github.com/kiangkuang
// @version      0.3
// @description  Buys stocks and visit the shrine for you everyday
// @author       Kiang Kuang
// @include      *
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.1/moment.min.js
// ==/UserScript==

(function() {
    "use strict";

    var config = {
        buyStocks: true,
        minPrice: 15,
        maxPrice: 17,
        stocksAmount: 1000,
        visitShrine: true,
    };

    // reset();

    var boughtStocks = GM_getValue('boughtStocks', 0);
    var buyingStocks = GM_getValue('buyingStocks', false);
    var clickedShrine = GM_getValue('clickedShrine', 0);
    var clickingShrine = GM_getValue('clickingShrine', false);

    var nst = moment().utcOffset(-7);

    if (config.buyStocks) {
        if (moment(boughtStocks).isBefore(nst, 'day') && !buyingStocks) {
            goToStocks();
            return;
        }
        if (document.URL.indexOf('/stockmarket.phtml?type=buy&ticker=') > -1 && buyingStocks) {
            GM_setValue('buyingStocks', false);
            GM_setValue('boughtStocks', moment().utcOffset(-7).format());
            buyStocks();
            return;
        }
    }

    if (config.visitShrine) {
        if (moment(clickedShrine).isBefore(nst, 'day') && !clickingShrine) {
            GM_setValue('clickingShrine', true);
            goToShrine();
            return;
        }
        if (window.location.pathname == '/desert/shrine.phtml' && clickingShrine) {
            GM_setValue('clickingShrine', false);
            GM_setValue('clickedShrine', moment().utcOffset(-7).format());
            clickShrine();
            return;
        }
    }

    function goToStocks() {
        $.ajax("http://www.neopets.com/stockmarket.phtml?type=list&full=true")
            .done(function(data) {
                var result = $.parseHTML(data);

                if ($(result).find('.welcomeContent').length === 0) {
                    for (var price = config.minPrice; price <= config.maxPrice; price++) {
                        var company = $($(result).find('.content td:nth-child(6):contains(' + price + ')').siblings()[1]).find('a').text();
                        if (company) {
                            GM_setValue('buyingStocks', true);
                            GM_setValue('stockPrice', price);
                            GM_openInTab("http://www.neopets.com/stockmarket.phtml?type=buy&ticker=" + company, true);
                            break;
                        }
                    }
                } else {
                    console.error("NeoHelper: Not logged in!");
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

    function reset() {
        GM_deleteValue('boughtStocks');
        GM_deleteValue('buyingStocks');
        GM_deleteValue('clickedShrine');
        GM_deleteValue('clickingShrine');
        GM_deleteValue('stockPrice');
    }
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