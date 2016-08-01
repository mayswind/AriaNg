(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLanguageLoader', ['$http', '$q', 'localStorageService', 'ariaNgConstants', 'ariaNgLanguages', function ($http, $q, localStorageService, ariaNgConstants, ariaNgLanguages) {
        return function (options) {
            var deferred = $q.defer();

            if (!ariaNgLanguages[options.key]) {
                deferred.reject(options.key);
                return deferred.promise;
            }

            var languageKey = ariaNgConstants.languageStorageKeyPrefix + '.' + options.key;
            var languageResource = localStorageService.get(languageKey);

            if (languageResource) {
                deferred.resolve(languageResource);
            }

            var languagePath = ariaNgConstants.languagePath + '/' + options.key + ariaNgConstants.languageFileExtension;

            $http({
                url: languagePath,
                method: 'GET'
            }).success(function (data) {
                localStorageService.set(languageKey, data);
                return deferred.resolve(data);
            }).error(function (data) {
                return deferred.reject(options.key);
            });

            return deferred.promise;
        };
    }]);
}());
