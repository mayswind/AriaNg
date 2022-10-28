(function () {
    'use strict';

    angular.module('ariaNg').filter('logOrderBy', ['$filter', 'ariaNgCommonService', function ($filter, ariaNgCommonService) {
        return function (array, type) {
            if (!angular.isArray(array) || !type) {
                return array;
            }

            var orderType = ariaNgCommonService.parseOrderType(type);

            if (orderType === null) {
                return array;
            }

            if (orderType.type === 'time') {
                return $filter('orderBy')(array, ['time'], orderType.reverse);
            } else {
                return array;
            }
        };
    }]);
}());
