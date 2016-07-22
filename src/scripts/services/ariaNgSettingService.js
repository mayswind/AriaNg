(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgSettingService', ['$window', '$location', '$filter', '$translate', 'base64', 'amMoment', 'localStorageService', 'ariaNgConstants', 'ariaNgDefaultOptions', 'ariaNgLanguages', function ($window, $location, $filter, $translate, base64, amMoment, localStorageService, ariaNgConstants, ariaNgDefaultOptions, ariaNgLanguages) {
        var onFirstVisitCallbacks = [];

        var fireFirstVisitEvent = function () {
            if (!angular.isArray(onFirstVisitCallbacks) || onFirstVisitCallbacks.length < 1) {
                return;
            }

            for (var i = 0; i < onFirstVisitCallbacks.length; i++) {
                var callback = onFirstVisitCallbacks[i];
                callback();
            }
        };

        var getDefaultLanguage = function () {
            var browserLang = $window.navigator.browserLanguage ? $window.navigator.browserLanguage : $window.navigator.language;

            if (!browserLang) {
                return ariaNgDefaultOptions.language;
            }

            browserLang = browserLang.replace(/\-/g, "_");

            if (!ariaNgLanguages[browserLang]) {
                return ariaNgDefaultOptions.language;
            }

            return browserLang;
        };

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
                options.language = getDefaultLanguage();

                setOptions(options);
                fireFirstVisitEvent();
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
                    options.secret = base64.decode(options.secret);
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
            getTitle: function () {
                return getOption('title');
            },
            getFinalTitle: function (context) {
                var title = this.getTitle();

                context = angular.extend({
                    downloadingCount: 0,
                    waitingCount: 0,
                    stoppedCount: 0,
                    downloadSpeed: 0,
                    uploadSpeed: 0
                }, context);

                title = title.replace(/\$\{downloading\}/g, $translate.instant('Downloading') + ': ' + context.downloadingCount);
                title = title.replace(/\$\{waiting\}/g, $translate.instant('Waiting') + ': ' + context.waitingCount);
                title = title.replace(/\$\{stopped\}/g, $translate.instant('Downloaded / Stopped') + ': ' + context.stoppedCount);
                title = title.replace(/\$\{downspeed\}/g, $translate.instant('Download') + ': ' + $filter('readableVolumn')(context.downloadSpeed) + '/s');
                title = title.replace(/\$\{upspeed\}/g, $translate.instant('Upload') + ': ' + $filter('readableVolumn')(context.uploadSpeed) + '/s');
                title = title.replace(/\$\{title\}/g, ariaNgConstants.title);

                return title;
            },
            setTitle: function (value) {
                setOption('title', value);
            },
            getTitleRefreshInterval: function () {
                return getOption('titleRefreshInterval');
            },
            setTitleRefreshInterval: function (value) {
                setOption('titleRefreshInterval', Math.max(parseInt(value), 0));
            },
            getBrowserNotification: function () {
                return getOption('browserNotification');
            },
            setBrowserNotification: function (value) {
                setOption('browserNotification', value);
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
            isUseWebSocket: function (protocol) {
                if (!protocol) {
                    protocol = this.getProtocol();
                }

                return protocol == 'ws' || protocol == 'wss';
            },
            getSecret: function () {
                var value = getOption('secret');
                return (value ? base64.decode(value) : value);
            },
            setSecret: function (value) {
                if (value) {
                    value = base64.encode(value);
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
            },
            onFirstAccess: function (callback) {
                if (!callback) {
                    return;
                }

                onFirstVisitCallbacks.push(callback);
            }
        };
    }]);
})();
