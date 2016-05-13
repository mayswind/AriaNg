(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgSettingService', ['$location', '$translate', 'localStorageService', 'ariaNgDefaultOptions', function ($location, $translate, localStorageService, ariaNgDefaultOptions) {
        var setOptions = function (options) {
            return localStorageService.set('Options', options);
        };

        var getOptions = function () {
            var options = localStorageService.get('Options');

            if (!options) {
                options = angular.extend({}, ariaNgDefaultOptions);
                setOptions(options);
            }

            return options;
        };

        var getOption = function (key) {
            return getOptions()[key];
        };

        var setOption = function (key, value) {
            var options = getOptions();
            options[key] = value;

            setOptions(options);
        };

        return {
            get: function (key) {
                return getOption(key);
            },
            set: function (key, value) {
                return setOption(key, value);
            },
            getLocaleName: function () {
                return getOption('localeName');
            },
            setLocaleName: function (value) {
                setOption('localeName', value);
                $translate.use(value);
            },
            getJsonRpcUrl: function () {
                var rpcHost = getOption('aria2RpcHost');

                if (!rpcHost) {
                    rpcHost = $location.$$host + ':6800';
                }

                return 'ws://' + rpcHost + '/jsonrpc';
            },
            getGlobalStatRefreshInterval: function () {
                return getOption('globalStatRefreshInterval');
            },
            getDownloadTaskRefreshInterval: function () {
                return getOption('downloadTaskRefreshInterval');
            },
            getDisplayOrder: function () {
                var value = getOption('displayOrder');
                
                if (!value) {
                    value = 'default';
                }
                
                return value;
            },
            setDisplayOrder: function (value) {
                setOption('displayOrder', value);
            }
        };
    }]);
})();
