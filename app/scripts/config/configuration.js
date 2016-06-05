(function () {
    'use strict';

    angular.module('ariaNg').config(['$translateProvider', 'localStorageServiceProvider', 'ariaNgConstants', function ($translateProvider, localStorageServiceProvider, ariaNgConstants) {
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
            .useSanitizeValueStrategy('escape');
    }]);
})();
