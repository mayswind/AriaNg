(function () {
    'use strict';

    angular.module('ariaNg').provider('ariaNgAssetsCacheService', [function () {
        var assetsRoot = {};
        var languageAssetsPrefix = 'languages.';
        
        var getAsset = function (path) {
            var parts = path.split('.'),
                result = assetsRoot;

            for (var i = 0; i < parts.length; i++) {
                if (angular.isUndefined(result[parts[i]])) {
                    return null;
                }

                result = result[parts[i]];
            }

            return result;
        };

        var setAsset = function (path, value) {
            var parts = path.split('.'),
                result = assetsRoot;

            for (var i = 0; i < parts.length - 1; i++) {
                if (angular.isUndefined(result[parts[i]])) {
                    result[parts[i]] = {};
                }

                result = result[parts[i]];
            }

            result[parts[parts.length - 1]] = value;
        };

        this.getLanguageAsset = function (languageName) {
            return getAsset(languageAssetsPrefix + languageName);
        };

        this.setLanguageAsset = function (languageName, languageContent) {
            setAsset(languageAssetsPrefix + languageName, languageContent);
        };

        this.$get = function () {
            var that = this;

            return {
                getLanguageAsset: function (languageName) {
                    return that.getLanguageAsset(languageName);
                }
            }
        };
    }]);
}());
