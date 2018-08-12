(function () {
    'use strict';

    angular.module('ariaNg').filter('longDate', ['ariaNgCommonService', 'ariaNgLocalizationService', function (ariaNgCommonService, ariaNgLocalizationService) {
        return function (time) {
            var format = ariaNgLocalizationService.getLongDateFormat();
            return ariaNgCommonService.formatDateTime(time, format);
        };
    }]);
}());
