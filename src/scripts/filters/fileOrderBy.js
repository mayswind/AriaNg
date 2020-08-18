(function () {
    'use strict';

    angular.module('ariaNg').filter('fileOrderBy', ['$filter', 'ariaNgCommonService', function ($filter, ariaNgCommonService) {
        return function (array, type) {
            if (!angular.isArray(array) || !type) {
                return array;
            }

            var orderType = ariaNgCommonService.parseOrderType(type);

            if (orderType === null) {
                return array;
            }

            if (orderType.type === 'index') {
                return $filter('orderBy')(array, ['index'], orderType.reverse);
            } else if (orderType.type === 'name') {
                return $filter('orderBy')(array, ['fileName'], orderType.reverse);
            } else if (orderType.type === 'size') {
                return $filter('orderBy')(array, ['length'], orderType.reverse);
            } else if (orderType.type === 'percent') {
                return $filter('orderBy')(array, ['completePercent'], orderType.reverse);
            } else if (orderType.type === 'selected') {
                return $filter('orderBy')(array, ['selected'], orderType.reverse);
            } else {
                return array;
            }
        };
    }]);
}());
