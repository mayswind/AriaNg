(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgSettingService', ['$location', '$base64', '$translate', 'amMoment', 'localStorageService', 'ariaNgConstants', 'ariaNgDefaultOptions', 'ariaNgLanguages', function ($location, $base64, $translate, amMoment, localStorageService, ariaNgConstants, ariaNgDefaultOptions, ariaNgLanguages) {
        var getDefaultRpcHost = function () {
            return $location.$$host;
        };

        var setOptions = function (options) {
            return localStorageService.set(ariaNgConstants.optionStorageKey, options);
        };

        var getOptions = function () {
            var options = localStorageService.get(ariaNgConstants.optionStorageKey);

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

                if (!options.rpcHost) {
                    options.rpcHost = getDefaultRpcHost();
                }

                if (options.secret) {
                    options.secret = $base64.decode(options.secret);
                }

                return options;
            },
            applyLanguage: function (lang) {
                if (!ariaNgLanguages[lang]) {
                    return false;
                }

                $translate.use(lang);
                amMoment.changeLocale(lang);

                return true;
            },
            getLanguage: function () {
                return getOption('language');
            },
            setLanguage: function (value) {
                if (this.applyLanguage(value)) {
                    setOption('language', value);
                }
            },
            getJsonRpcUrl: function () {
                var protocol = getOption('protocol');
                var rpcHost = getOption('rpcHost');
                var rpcPort = getOption('rpcPort');

                if (!rpcHost) {
                    rpcHost = getDefaultRpcHost();
                }

                return protocol + '://' + rpcHost + ':' + rpcPort + '/jsonrpc';
            },
            setRpcHost: function (value) {
                setOption('rpcHost', value);
            },
            setRpcPort: function (value) {
                setOption('rpcPort', Math.max(parseInt(value), 0));
            },
            getProtocol: function () {
                return getOption('protocol');
            },
            setProtocol: function (value) {
                setOption('protocol', value);
            },
            getSecret: function () {
                var value = getOption('secret');
                return (value ? $base64.decode(value) : value);
            },
            setSecret: function (value) {
                if (value) {
                    value = $base64.encode(value);
                }

                setOption('secret', value);
            },
            getGlobalStatRefreshInterval: function () {
                return getOption('globalStatRefreshInterval');
            },
            setGlobalStatRefreshInterval: function (value) {
                setOption('globalStatRefreshInterval', Math.max(parseInt(value), 0));
            },
            getDownloadTaskRefreshInterval: function () {
                return getOption('downloadTaskRefreshInterval');
            },
            setDownloadTaskRefreshInterval: function (value) {
                setOption('downloadTaskRefreshInterval', Math.max(parseInt(value), 0));
            },
            getDisplayOrder: function () {
                var value = getOption('displayOrder');

                if (!value) {
                    value = 'default:asc';
                }

                return value;
            },
            setDisplayOrder: function (value) {
                setOption('displayOrder', value);
            },
            getFileListDisplayOrder: function () {
                var value = getOption('fileListDisplayOrder');

                if (!value) {
                    value = 'default:asc';
                }

                return value;
            },
            setFileListDisplayOrder: function (value) {
                setOption('fileListDisplayOrder', value);
            },
            getPeerListDisplayOrder: function () {
                var value = getOption('peerListDisplayOrder');

                if (!value) {
                    value = 'default:asc';
                }

                return value;
            },
            setPeerListDisplayOrder: function (value) {
                setOption('peerListDisplayOrder', value);
            }
        };
    }]);
})();
