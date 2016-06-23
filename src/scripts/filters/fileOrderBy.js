(function () {
    'use strict';

    angular.module('ariaNg').filter('fileOrderBy', ['orderByFilter', 'ariaNgCommonService', function (orderByFilter, ariaNgCommonService) {
        return function (array, type) {
            if (!angular.isArray(array)) {
                return array;
            }

            var orderType = ariaNgCommonService.parseOrderType(type);

            if (orderType == null) {
                return array;
            }

            if (orderType.type == 'name') {
                return orderByFilter(array, ['fileName'], orderType.reverse);
            } else if (orderType.type == 'size') {
                return orderByFilter(array, ['length'], orderType.reverse);
            } else if (orderType.type == 'percent') {
                return orderByFilter(array, ['completePercent'], orderType.reverse);
            } else {
                return array;
            }
        }
    }]);
})();
