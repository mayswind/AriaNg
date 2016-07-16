(function () {
    'use strict';

    angular.module('ariaNg').config(['$translateProvider', 'localStorageServiceProvider', 'NotificationProvider', 'ariaNgConstants', function ($translateProvider, localStorageServiceProvider, NotificationProvider, ariaNgConstants) {
        localStorageServiceProvider
            .setPrefix(ariaNgConstants.appPrefix)
            .setStorageType('localStorage')
            .setStorageCookie(365, '/');

        $translateProvider.useStaticFilesLoader({
            prefix: 'langs/',
            suffix: '.json'
        }).useLoaderCache(true)
            .preferredLanguage('en')
            .fallbackLanguage('en')
            .useSanitizeValueStrategy('escapeParameters');

        NotificationProvider.setOptions({
            delay: ariaNgConstants.notificationInPageTimeout
        });
    }]);
})();
