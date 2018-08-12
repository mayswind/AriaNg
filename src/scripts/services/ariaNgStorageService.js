(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgStorageService', ['$window', 'localStorageService', function ($window, localStorageService) {
        return {
            isLocalStorageSupported: function () {
                return localStorageService.isSupported;
            },
            isCookiesSupported: function () {
                return localStorageService.cookie.isSupported;
            },
            get: function (key) {
                return localStorageService.get(key);
            },
            set: function (key, value) {
                return localStorageService.set(key, value);
            },
            remove: function (key) {
                return localStorageService.remove(key);
            },
            clearAll: function () {
                return localStorageService.clearAll();
            },
            keys: function (prefix) {
                var allKeys = localStorageService.keys();

                if (!allKeys || !allKeys.length || !prefix) {
                    return allKeys;
                }

                var result = [];

                for (var i = 0; i < allKeys.length; i++) {
                    if (allKeys[i].indexOf(prefix) >= 0) {
                        result.push(allKeys[i]);
                    }
                }

                return result;
            }
        };
    }]);
}());
