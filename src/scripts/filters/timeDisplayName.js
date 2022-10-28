(function () {
    'use strict';

    angular.module('ariaNg').filter('timeDisplayName', ['ariaNgCommonService', 'ariaNgLocalizationService', function (ariaNgCommonService, ariaNgLocalizationService) {
        return function (time, defaultName) {
            if (!time) {
                return ariaNgLocalizationService.getLocalizedText(defaultName);
            }

            var option = ariaNgCommonService.getTimeOption(time);

            return ariaNgLocalizationService.getLocalizedText(option.name, {
                value: option.value
            });
        };
    }]);
}());
