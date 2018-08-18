var baseURL = 'https://smallfolio.bitnamiapp.com/10/';
var app = angular.module('app', []);

app.controller('main', ['$scope', '$http', '$rootScope',
    function($scope, $http, $rootScope) {

    $scope.total = 0;
    $scope.set = [];

    update($scope);

    $scope.add = function () {
        var symbol = $scope.symbol;
        var amount = $scope.amount;

        var getURL = baseURL + 'portfolio_add_coin.php?token='
            + symbol + '&cur=USD'

        $.getJSON(getURL, function(json) {
            var portfolioSize = getPortfolioSize();
            var status = json[0].status;
            var id = json[1].Data[0].token_id;

            if(status == 1)
            {
                var pInput = 'portfolioCoin0' + portfolioSize;
                var inputCount = 'portfolioCount0' + portfolioSize;

                localStorage.setItem(pInput, id);
                localStorage.setItem(inputCount, amount);

                portfolioSizeAdd();
                update($scope);
            }
        });
    };

    $scope.remove = function(coin) {
        removeCoin($scope, coin.index);
    }
}]);

function removeCoin($scope, index) {
    var portfolioSize = getPortfolioSize();
    var removeStrCoin;
    var removeStrCount;

    removeStrCoin = 'portfolioCoin0' + (portfolioSize - 1);
    removeStrCount = 'portfolioCount0' + (portfolioSize - 1);

    for(var i = index; i < portfolioSize - 1; i++) {
        var tempCoin = localStorage.getItem('portfolioCoin0' + (i + 1));
        var tempCount = localStorage.getItem('portfolioCount0' + (i + 1));

        var tci = 'portfolioCoin0' + i;
        var tni = 'portfolioCount0' + i;

        localStorage.setItem(tci, tempCoin);
        localStorage.setItem(tni, tempCount);
    }

    localStorage.removeItem(removeStrCoin);
    localStorage.removeItem(removeStrCount);

    portfolioSizeSub();

    update($scope);
}

function getPortfolioSize() {
    var currentSize = localStorage.getItem('portfolioSize');

    if(currentSize == null) {
        localStorage.setItem('portfolioSize', 0);
        currentSize = 0;
    }

    return currentSize;
}

function portfolioSizeAdd() {
    var currentSize = localStorage.getItem('portfolioSize');
    var newSize = parseInt(currentSize) + 1;

    localStorage.setItem('portfolioSize', newSize);
}

function portfolioSizeSub() {
    var currentSize = localStorage.getItem('portfolioSize');
    var newSize = parseInt(currentSize) - 1;

    localStorage.setItem('portfolioSize', newSize);
}

function getPortfolioInfo() {
    var getURL;
    var portfolioSize = getPortfolioSize();
    var portfolioString = '';

    for(var i = 0; i < portfolioSize; i++) {
        var getInst = 'portfolioCoin0' + i;
        var getID = localStorage.getItem(getInst);

        if(i != portfolioSize - 1) {
            portfolioString += getID + ',';
        } else {
            portfolioString += getID
        }
    }

    getURL = baseURL + 'portfolio_view.php?pair=BTC&cur=USD&token=' +
        portfolioString + '&type=0'

    return getURL;
}

function getPortfolioCounts() {
    var counts = [];
    var portfolioSize = getPortfolioSize();

    for(var i = 0; i < portfolioSize; i++) {
        var getInst = 'portfolioCount0' + i;
        var getCount = localStorage.getItem(getInst);

        counts.push(getCount);
    }

    return counts;
}

function formatDollar(str) {

    var fixed = parseFloat(str).toFixed(2);

    fixed = parseFloat(fixed).toLocaleString();
    fixed = '$' + fixed;

    return fixed;
}

function update($scope) {
    var portfolioURL = getPortfolioInfo();
    var counts = getPortfolioCounts();

    $.getJSON(portfolioURL, function(json) {
        if(json[0].Response != 'Empty') {
            var coins = [];
            var percentages = [];
            var len = json[1].length;
            var total = 0;
            var totalBTC = 0;

            for(var i = 0; i < len; i++) {
                total += counts[i] * json[1][i].price_usd;
                totalBTC += counts[i] * json[1][i].price_btc;
            }

            for(var i = 0; i < len; i++) {
                var name = json[1][i].name;
                var coinPrice = json[1][i].price_usd;
                var symbol = json[1][i].symbol;

                var icon = "https://smallfolio.bitnamiapp.com" +
                    "/dl_icon/" + symbol + ".png";

                var userPrice = (counts[i] * coinPrice);
                var p = (userPrice / total * 100).toFixed(2) + '%';

                userPrice = formatDollar(userPrice);
                coinPrice = formatDollar(coinPrice);

                var add = { 'index': i,
                            'icon': icon,
                            'name': name,
                            'percentage': p,
                            'userPrice': userPrice,
                            'count': counts[i],
                            'coinPrice': coinPrice};

                coins.push(add);
            }

            $scope.set = coins;
            $scope.totalCur = formatDollar(total);
            $scope.totalBTC = totalBTC.toFixed(3) + ' BTC';

            $scope.$apply();
        }
    });
}
