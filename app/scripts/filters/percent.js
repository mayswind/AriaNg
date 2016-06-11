(function () {
    'use strict';

    angular.module('ariaNg').filter('percent', ['numberFilter', function (numberFilter) {
        return function (value, precision) {
            var ratio = Math.pow(10, precision);
            var result = parseInt(value * ratio) / ratio;

            return numberFilter(result, precision);
        }
    }]);
})();
