(function () {
    'use strict';

    angular.module('ariaNg').filter('percent', ['$filter', function ($filter) {
        return function (value, precision) {
            var ratio = Math.pow(10, precision);
            var result = parseInt(value * ratio) / ratio;

            return $filter('number')(result, precision);
        };
    }]);
}());
