(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLanguageLoader', ['$http', '$q', 'localStorageService', 'ariaNgConstants', 'ariaNgLanguages', function ($http, $q, localStorageService, ariaNgConstants, ariaNgLanguages) {
        var getKeyValuePair = function (line) {
            var equalSignPos = line.indexOf('=');

            if (equalSignPos > 0) {
                return {
                    key: line.substring(0, equalSignPos),
                    value: line.substring(equalSignPos + 1, line.length)
                }
            } else {
                return {
                    value: line
                };
            }
        };

        var getCategory = function (langObj, category) {
            var currentCategory = langObj;

            if (!category) {
                return currentCategory;
            }

            if (category[0] === '[' && category[category.length - 1] === ']') {
                category = category.substring(1, category.length - 1);
            }

            if (category === 'default') {
                return currentCategory;
            }

            var categoryNames = category.split('.');

            for (var i = 0; i < categoryNames.length; i++) {
                var categoryName = categoryNames[i];

                if (!currentCategory[categoryName]) {
                    currentCategory[categoryName] = {};
                }

                currentCategory = currentCategory[categoryName];
            }

            return currentCategory;
        };

        var getLanguageObject = function (languageContent) {
            var langObj = {};

            if (!languageContent) {
                return langObj;
            }

            var lines = languageContent.split('\n');
            var currentCatagory = langObj;

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];

                if (!line) {
                    continue;
                }

                if (/^\[.+\]$/.test(line)) {
                    currentCatagory = getCategory(langObj, line);
                    continue;
                }

                var pair = getKeyValuePair(line);

                if (pair && pair.key) {
                    currentCatagory[pair.key] = pair.value;
                }
            }

            return langObj;
        };

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
                var languageObject = getLanguageObject(data);
                localStorageService.set(languageKey, languageObject);
                return deferred.resolve(languageObject);
            }).error(function (data) {
                return deferred.reject(options.key);
            });

            return deferred.promise;
        };
    }]);
}());
