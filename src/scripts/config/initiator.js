(function () {
    'use strict';

    angular.module('ariaNg').run(['moment', 'ariaNgLocalizationService', 'ariaNgSettingService', function (moment, ariaNgLocalizationService, ariaNgSettingService) {
        var language = ariaNgSettingService.getLanguage();

        moment.updateLocale('zh-cn', {
            week: null
        });

        ariaNgLocalizationService.applyLanguage(language);
    }]);
}());
