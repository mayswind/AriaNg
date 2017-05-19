(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLanguageLoader', ['$http', '$q', 'localStorageService', 'ariaNgConstants', 'ariaNgLanguages', function ($http, $q, localStorageService, ariaNgConstants, ariaNgLanguages) {
        var getKeyValuePair = function (line) {
            for (var i = 0; i < line.length; i++) {
                if (i > 0 && line.charAt(i - 1) !== '\\' && line.charAt(i) === '=') {
                    return {
                        key: line.substring(0, i).replace('\\=', '='),
                        value: line.substring(i + 1, line.length).replace('\\=', '=')
                    };
                }
            }

            return {
                value: line
            };
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

                line = line.replace('\r', '');

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
            }).then(function onSuccess(response) {
                var languageObject = getLanguageObject(response.data);
                localStorageService.set(languageKey, languageObject);
                return deferred.resolve(languageObject);
            }).catch(function onError(response) {
                return deferred.reject(options.key);
            });

            return deferred.promise;
        };
    }]);
}());
