(function () {
    'use strict';

    angular.module('ariaNg').filter('longDate', ['$translate', 'moment', function ($translate, moment) {
        return function (time) {
            var format = $translate.instant('format.longdate');
            return moment(time).format(format);
        };
    }]);
}());
