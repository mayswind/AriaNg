(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLocalizationService', ['$translate', 'amMoment', function ($translate, amMoment) {
        return {
            applyLanguage: function (lang) {
                $translate.use(lang);
                amMoment.changeLocale(lang);

                return true;
            },
            getLocalizedText: function (text, params) {
                return $translate.instant(text, params);
            },
            getLongDateFormat: function () {
                return this.getLocalizedText('format.longdate');
            }
        };
    }]);
}());
