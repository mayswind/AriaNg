(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgSettingService', ['$location', '$translate', 'amMoment', 'localStorageService', 'ariaNgDefaultOptions', function ($location, $translate, amMoment, localStorageService, ariaNgDefaultOptions) {
        var getDefaultJsonRpcHost = function () {
            var rpcHost = $location.$$host + ':6800';
            return rpcHost;
        };

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
            var options = getOptions();

            if (angular.isUndefined(options[key])) {
                options[key] = ariaNgDefaultOptions[key];
                setOptions(options);
            }

            return options[key];
        };

        var setOption = function (key, value) {
            var options = getOptions();
            options[key] = value;

            setOptions(options);
        };

        return {
            getAllOptions: function () {
                var options = angular.extend({}, ariaNgDefaultOptions, getOptions());

                if (!options.aria2RpcHost) {
                    options.aria2RpcHost = getDefaultJsonRpcHost();
                }

                return options;
            },
            setAllOptions: function (options) {
                setOptions(options);
            },
            getLanguage: function () {
                return getOption('language');
            },
            setLanguage: function (value) {
                setOption('language', value);
                $translate.use(value);
                amMoment.changeLocale(value);
            },
            getJsonRpcUrl: function (protocol) {
                var rpcHost = getOption('aria2RpcHost');

                if (!rpcHost) {
                    rpcHost = getDefaultJsonRpcHost();
                }

                return protocol + '://' + rpcHost + '/jsonrpc';
            },
            setJsonRpcHost: function (value) {
                setOption('aria2RpcHost', value);
            },
            getProtocol: function () {
                return getOption('protocol');
            },
            setProtocol: function (value) {
                setOption('protocol', value);
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
