(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLanguageLoader', ['$http', '$q', 'ariaNgConstants', 'ariaNgLanguages', 'ariaNgAssetsCacheService', 'ariaNgNotificationService', 'ariaNgLogService', 'ariaNgStorageService', function ($http, $q, ariaNgConstants, ariaNgLanguages, ariaNgAssetsCacheService, ariaNgNotificationService, ariaNgLogService, ariaNgStorageService) {
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

            if (category === 'global') {
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

                if (pair && pair.key && pair.value && pair.value !== '') {
                    currentCatagory[pair.key] = pair.value;
                }
            }

            return langObj;
        };

        var isLanguageResourceEquals = function (langObj1, langObj2) {
            if (!angular.isObject(langObj1) || !angular.isObject(langObj2)) {
                return false;
            }

            for (var key in langObj2) {
                if (!langObj2.hasOwnProperty(key)) {
                    continue;
                }

                var value = langObj2[key];

                if (angular.isObject(value)) {
                    var result = isLanguageResourceEquals(langObj1[key], value);
                    if (!result) {
                        return false;
                    }
                } else {
                    if (value !== langObj1[key]) {
                        return false;
                    }
                }
            }

            return true;
        };

        return function (options) {
            var deferred = $q.defer();

            if (!ariaNgLanguages[options.key]) {
                deferred.reject(options.key);
                return deferred.promise;
            }

            var languageKey = ariaNgConstants.languageStorageKeyPrefix + '.' + options.key;
            var languageResource = ariaNgStorageService.get(languageKey);

            if (languageResource) {
                deferred.resolve(languageResource);
            }

            if (ariaNgAssetsCacheService.getLanguageAsset(options.key)) {
                var languageObject = getLanguageObject(ariaNgAssetsCacheService.getLanguageAsset(options.key));
                ariaNgStorageService.set(languageKey, languageObject);
                deferred.resolve(languageObject);

                return deferred.promise;
            }

            var languagePath = ariaNgConstants.languagePath + '/' + options.key + ariaNgConstants.languageFileExtension;

            $http({
                url: languagePath,
                method: 'GET'
            }).then(function onSuccess(response) {
                var languageObject = getLanguageObject(response.data);
                var languageUpdated = false;

                if (languageResource) {
                    languageUpdated = !isLanguageResourceEquals(languageResource, languageObject);
                }

                ariaNgStorageService.set(languageKey, languageObject);

                if (languageUpdated) {
                    ariaNgLogService.info('[ariaNgLanguageLoader] load language resource successfully, and resource is updated');
                    ariaNgNotificationService.notifyInPage('', 'Language resource has been updated, please reload the page for the changes to take effect.', {
                        delay: false,
                        type: 'info',
                        templateUrl: 'views/notification-reloadable.html'
                    });
                } else {
                    ariaNgLogService.info('[ariaNgLanguageLoader] load language resource successfully, but resource is not updated');
                }

                return deferred.resolve(languageObject);
            }).catch(function onError(response) {
                ariaNgLogService.warn('[ariaNgLanguageLoader] cannot get language resource');
                if (!languageResource) {
                    ariaNgNotificationService.notifyInPage('', 'AriaNg cannot get language resources, and will display in default language.', {
                        type: 'error',
                        delay: false
                    });
                }
                return deferred.reject(options.key);
            });

            return deferred.promise;
        };
    }]);
}());
