(function () {
    'use strict';

    angular.module('ariaNg').filter('readableVolume', ['$filter', function ($filter) {
        var units = [ 'B', 'KB', 'MB', 'GB' ];
        var defaultFractionSize = 2;

        var getAutoFractionSize = function (value) {
            if (value < 1) {
                return 2;
            } else if (value < 10) {
                return 1;
            } else {
                return 0;
            }
        };

        return function (value, fractionSize) {
            var unit = units[0];
            var actualFractionSize = defaultFractionSize;
            var autoFractionSize = false;

            if (angular.isNumber(fractionSize)) {
                actualFractionSize = fractionSize;
            } else if (fractionSize === 'auto') {
                autoFractionSize = true;
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

            if (autoFractionSize) {
                actualFractionSize = getAutoFractionSize(value);
            }

            value = $filter('number')(value, actualFractionSize);

            return value + ' ' + unit;
        };
    }]);
}());
