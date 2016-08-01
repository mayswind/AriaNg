(function () {
    'use strict';

    angular.module('ariaNg').config(['$translateProvider', 'localStorageServiceProvider', 'NotificationProvider', 'ariaNgConstants', function ($translateProvider, localStorageServiceProvider, NotificationProvider, ariaNgConstants) {
        localStorageServiceProvider
            .setPrefix(ariaNgConstants.appPrefix)
            .setStorageType('localStorage')
            .setStorageCookie(365, '/');

        $translateProvider.useLoader('ariaNgLanguageLoader')
            .useLoaderCache(true)
            .preferredLanguage(ariaNgConstants.defaultLanguage)
            .fallbackLanguage(ariaNgConstants.defaultLanguage)
            .useSanitizeValueStrategy('escapeParameters');

        NotificationProvider.setOptions({
            delay: ariaNgConstants.notificationInPageTimeout
        });
    }]);
}());
