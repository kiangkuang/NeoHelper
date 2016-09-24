// ==UserScript==
// @name         NeoHelper
// @namespace    https://github.com/kiangkuang
// @version      0.1
// @description  Buys stocks and visit the shrine for you everyday
// @author       Kiang Kuang
// @include      *
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.1/moment.min.js
// ==/UserScript==

//GM_deleteValue('boughtStocks');
//GM_deleteValue('buyingStocks');
//GM_deleteValue('clickedShrine');
//GM_deleteValue('clickingShrine');

nst = moment().utcOffset(-7);
boughtStocks = GM_getValue('boughtStocks', 0);
buyingStocks = GM_getValue('buyingStocks', false);
clickedShrine = GM_getValue('clickedShrine', 0);
clickingShrine = GM_getValue('clickingShrine', false);

function goToStocks() {
    $.ajax("http://www.neopets.com/stockmarket.phtml?type=list&full=true")
        .done(function(data) {
            result = $.parseHTML(data);

            for (price = 15; price < 17; price++) {
                var company = $($(result).find('.content td:nth-child(6):contains(' + price + ')').siblings()[1]).find('a').text();
                if (company) {
                    GM_setValue('buyingStocks', true);
                    window.location.href = "http://www.neopets.com/stockmarket.phtml?type=buy&ticker=" + company;
                    break;
                }
            }
        });
}

function buyStocks() {
    $('.content input[name="amount_shares"]').val('1000');
    $('.content form').submit();
}

function goToShrine() {
    window.location.href = 'http://www.neopets.com/desert/shrine.phtml';
}

function clickShrine() {
    $('.content form:nth-child(3)').submit();
}

(function() {

if (moment(boughtStocks).isBefore(nst, 'day') && !buyingStocks) {
    goToStocks();
} else if (document.URL.indexOf('/stockmarket.phtml?type=buy&ticker=') > -1 && buyingStocks) {
    GM_setValue('buyingStocks', false);
    GM_setValue('boughtStocks', moment().utcOffset(-7).format());
    buyStocks();
} else if (moment(clickedShrine).isBefore(nst, 'day') && !clickingShrine) {
    GM_setValue('clickingShrine', true);
    goToShrine();
} else if (window.location.pathname == '/desert/shrine.phtml' && clickingShrine) {
    GM_setValue('clickingShrine', false);
    GM_setValue('clickedShrine', moment().utcOffset(-7).format());
    clickShrine();
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