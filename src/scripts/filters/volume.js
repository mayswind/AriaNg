(function () {
    'use strict';

    angular.module('ariaNg').filter('readableVolume', ['$filter', function ($filter) {
        var units = [ 'B', 'KB', 'MB', 'GB' ];
        var defaultFractionSize = 2;

        return function (value, fractionSize) {
            var unit = units[0];

            if (angular.isUndefined(fractionSize)) {
                fractionSize = defaultFractionSize;
            }

            if (!value) {
                value = 0;
            }

            if (!angular.isNumber(value)) {
                value = parseInt(value);
            }

            for (var i = 1; i < units.length; i++) {
                if (value >= 1024) {
                    value = value / 1024;
                    unit = units[i];
                } else {
                    break;
                }
            }

            value = $filter('number')(value, fractionSize);

            return value + ' ' + unit;
        };
    }]);
}());
