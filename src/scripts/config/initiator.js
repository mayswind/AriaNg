(function () {
    'use strict';

    angular.module('ariaNg').run(['moment', 'ariaNgSettingService', function (moment, ariaNgSettingService) {
        var language = ariaNgSettingService.getLanguage();

        moment.updateLocale('zh-cn', {
            week: null
        });

        ariaNgSettingService.applyLanguage(language);
    }]);
}());
