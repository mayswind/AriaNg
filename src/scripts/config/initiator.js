(function () {
    'use strict';

    angular.module('ariaNg').run(['amMoment', 'moment', 'ariaNgSettingService', function (amMoment, moment, ariaNgSettingService) {
        var language = ariaNgSettingService.getLanguage();

        moment.updateLocale('zh-cn', {
            week: null
        });

        amMoment.changeLocale(language);
        ariaNgSettingService.applyLanguage(language);
    }]);
}());
