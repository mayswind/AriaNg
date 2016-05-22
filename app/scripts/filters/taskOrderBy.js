(function () {
    'use strict';

    angular.module("ariaNg").filter('taskOrderBy', ['orderByFilter', 'utils', function (orderByFilter, utils) {
        return function (array, type) {
            if (!angular.isArray(array)) {
                return array;
            }
            
            var orderType = utils.parseOrderType(type);
            
            if (orderType == null) {
                return array;
            }

            if (orderType.type == 'name') {
                return orderByFilter(array, ['taskName'], orderType.reverse);
            } else if (orderType.type == 'size') {
                return orderByFilter(array, ['totalLength'], orderType.reverse);
            } else if (orderType.type == 'percent') {
                return orderByFilter(array, ['completePercent'], orderType.reverse);
            } else if (orderType.type == 'remain') {
                return orderByFilter(array, ['idle', 'remainTime'], orderType.reverse);
            } else if (orderType.type == 'dspeed') {
                return orderByFilter(array, ['downloadSpeed'], orderType.reverse);
            } else {
                return array;
            }
        }
    }]);
})();
