(function () {
    'use strict';

    angular.module("ariaNg").filter('readableVolumn', ['numberFilter', function (numberFilter) {
        var units = [ 'B', 'KB', 'MB', 'GB' ];

        return function (value) {
            var unit = units[0];

            if (!value) {
                value = 0;
            } else {
                for (var i = 1; i < units.length; i++) {
                    if (value >= 1024) {
                        value = value / 1024;
                        unit = units[i];
                    } else {
                        break;
                    }
                }

                value = numberFilter(value, 2);
            }

            return value + ' ' + unit;
        }
    }]);
})();
