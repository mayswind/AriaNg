(function () {
    'use strict';

    angular.module("ariaNg").filter('taskOrderBy', ['orderByFilter', function (orderByFilter) {
        return function (array, type) {
            if (!angular.isArray(array)) {
                return array;
            }

            if (type == 'name') {
                return orderByFilter(array, ['taskName'], false);
            } else if (type == 'size') {
                return orderByFilter(array, ['fileSize'], false);
            } else if (type == 'percent') {
                return orderByFilter(array, ['completePercent'], true);
            } else if (type == 'remain') {
                return orderByFilter(array, ['idle', 'remainTime'], false);
            } else {
                return array;
            }
        }
    }]);
})();
