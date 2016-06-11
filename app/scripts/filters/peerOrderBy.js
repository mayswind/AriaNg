(function () {
    'use strict';

    angular.module('ariaNg').filter('peerOrderBy', ['orderByFilter', 'ariaNgCommonService', function (orderByFilter, ariaNgCommonService) {
        return function (array, type) {
            if (!angular.isArray(array)) {
                return array;
            }

            var orderType = ariaNgCommonService.parseOrderType(type);

            if (orderType == null) {
                return array;
            }

            if (orderType.type == 'address') {
                return orderByFilter(array, ['ip', 'port'], orderType.reverse);
            } else if (orderType.type == 'percent') {
                return orderByFilter(array, ['completePercent'], orderType.reverse);
            } else if (orderType.type == 'dspeed') {
                return orderByFilter(array, ['downloadSpeed'], orderType.reverse);
            } else if (orderType.type == 'uspeed') {
                return orderByFilter(array, ['uploadSpeed'], orderType.reverse);
            } else {
                return array;
            }
        }
    }]);
})();
