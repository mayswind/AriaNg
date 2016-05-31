(function () {
    'use strict';

    angular.module("ariaNg").filter('taskOrderBy', ['orderByFilter', 'ariaNgCommonService', function (orderByFilter, ariaNgCommonService) {
        return function (array, type) {
            if (!angular.isArray(array)) {
                return array;
            }

            var orderType = ariaNgCommonService.parseOrderType(type);

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
                return orderByFilter(array, ['idle', 'remainTime', 'remainLength'], orderType.reverse);
            } else if (orderType.type == 'dspeed') {
                return orderByFilter(array, ['downloadSpeed'], orderType.reverse);
            } else {
                return array;
            }
        }
    }]);
})();
