(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgSettingService', ['$window', '$location', '$filter', 'ariaNgConstants', 'ariaNgDefaultOptions', 'ariaNgLanguages', 'ariaNgCommonService', 'ariaNgLogService', 'ariaNgStorageService', function ($window, $location, $filter, ariaNgConstants, ariaNgDefaultOptions, ariaNgLanguages, ariaNgCommonService, ariaNgLogService, ariaNgStorageService) {
        var browserFeatures = (function () {
            var supportLocalStroage = ariaNgStorageService.isLocalStorageSupported();
            var supportCookies = ariaNgStorageService.isCookiesSupported();

            return {
                localStroage: supportLocalStroage,
                cookies: supportCookies
            };
        })();
        var browserSupportStorage = browserFeatures.localStroage || browserFeatures.cookies;
        var browserSupportAppCache = !!$window.applicationCache;

        var onAppCacheUpdatedCallbacks = [];
        var onFirstVisitCallbacks = [];
        var firstVisitCallbackFired = false;
        var sessionSettings = {
            debugMode: false
        };

        if (browserSupportAppCache) {
            var appCache = $window.applicationCache;
            appCache.addEventListener('updateready', function (e) {
                for (var i = 0; i < onAppCacheUpdatedCallbacks.length; i++) {
                    var callback = onAppCacheUpdatedCallbacks[i];
                    callback();
                }
            }, false);
        }

        var fireFirstVisitEvent = function () {
            if (!browserSupportStorage) {
                return;
            }

            if (firstVisitCallbackFired || !angular.isArray(onFirstVisitCallbacks) || onFirstVisitCallbacks.length < 1) {
                return;
            }

            for (var i = 0; i < onFirstVisitCallbacks.length; i++) {
                var callback = onFirstVisitCallbacks[i];
                callback();
            }

            firstVisitCallbackFired = true;
        };

        var isInsecureProtocolDisabled = function () {
            var protocol = $location.protocol();

            return protocol === 'https';
        };

        var getLanguageNameFromAlias = function (alias) {
            for (var langName in ariaNgLanguages) {
                if (!ariaNgLanguages.hasOwnProperty(langName)) {
                    continue;
                }

                var language = ariaNgLanguages[langName];
                var aliases = language.aliases;

                if (!angular.isArray(aliases) || aliases.length < 1) {
                    continue;
                }

                for (var i = 0; i < aliases.length; i++) {
                    if (aliases[i] === alias) {
                        return langName;
                    }
                }
            }

            return null;
        };

        var getDefaultLanguage = function () {
            var browserLang = $window.navigator.browserLanguage ? $window.navigator.browserLanguage : $window.navigator.language;

            if (!browserLang) {
                return ariaNgDefaultOptions.language;
            }

            browserLang = browserLang.replace(/\-/g, '_');

            if (!ariaNgLanguages[browserLang]) {
                var languageName = getLanguageNameFromAlias(browserLang);

                if (languageName) {
                    browserLang = languageName;
                }
            }

            if (!ariaNgLanguages[browserLang]) {
                return ariaNgDefaultOptions.language;
            }

            return browserLang;
        };

        var getLanguageNameFromAliasOrDefaultLanguage = function (lang) {
            var languageName = getLanguageNameFromAlias(lang);

            if (languageName) {
                return languageName;
            }

            return getDefaultLanguage();
        };

        var getDefaultRpcHost = function () {
            var currentHost = $location.host();

            if (currentHost) {
                return currentHost;
            }

            return ariaNgConstants.defaultHost;
        };

        var setOptions = function (options) {
            return ariaNgStorageService.set(ariaNgConstants.optionStorageKey, options);
        };

        var getOptions = function () {
            var options = ariaNgStorageService.get(ariaNgConstants.optionStorageKey);

            if (options && !ariaNgLanguages[options.language]) {
                options.language = getLanguageNameFromAliasOrDefaultLanguage(options.language);
            }

            if (!options) {
                options = angular.extend({}, ariaNgDefaultOptions);
                options.language = getDefaultLanguage();

                if (!options.rpcHost) {
                    initRpcSettingWithDefaultHostAndProtocol(options);
                }

                if (angular.isArray(options.extendRpcServers)) {
                    for (var i = 0; i < options.extendRpcServers.length; i++) {
                        var rpcSetting = options.extendRpcServers[i];

                        if (!rpcSetting.rpcHost) {
                            initRpcSettingWithDefaultHostAndProtocol(rpcSetting);
                        }
                    }
                }

                setOptions(options);
                fireFirstVisitEvent();
            }

            return options;
        };

        var clearAll = function () {
            return ariaNgStorageService.clearAll();
        };

        var getOption = function (key) {
            var options = getOptions();

            if (angular.isUndefined(options[key]) && angular.isDefined(ariaNgDefaultOptions[key])) {
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

        var initRpcSettingWithDefaultHostAndProtocol = function (setting) {
            setting.rpcHost = getDefaultRpcHost();

            if (isInsecureProtocolDisabled()) {
                setting.protocol = ariaNgConstants.defaultSecureProtocol;
            }
        };

        var cloneRpcSetting = function (setting) {
            return {
                rpcAlias: setting.rpcAlias,
                rpcHost: setting.rpcHost,
                rpcPort: setting.rpcPort,
                rpcInterface: setting.rpcInterface,
                protocol: setting.protocol,
                httpMethod: setting.httpMethod,
                secret: setting.secret
            };
        };

        var createNewRpcSetting = function () {
            var setting = cloneRpcSetting(ariaNgDefaultOptions);
            setting.rpcId = ariaNgCommonService.generateUniqueId();

            initRpcSettingWithDefaultHostAndProtocol(setting);

            return setting;
        };

        return {
            isBrowserSupportStorage: function () {
                return browserSupportStorage;
            },
            isBrowserSupportApplicationCache: function () {
                return browserSupportAppCache;
            },
            getBrowserFeatures: function () {
                return browserFeatures;
            },
            getAllOptions: function () {
                var options = angular.extend({}, ariaNgDefaultOptions, getOptions());

                if (options.secret) {
                    options.secret = ariaNgCommonService.base64Decode(options.secret);
                }

                if (angular.isArray(options.extendRpcServers)) {
                    for (var i = 0; i < options.extendRpcServers.length; i++) {
                        var rpcSetting = options.extendRpcServers[i];

                        if (rpcSetting.secret) {
                            rpcSetting.secret = ariaNgCommonService.base64Decode(rpcSetting.secret);
                        }
                    }
                }

                return options;
            },
            getAllRpcSettings: function () {
                var result = [];

                var options = this.getAllOptions();
                var defaultRpcSetting = cloneRpcSetting(options);
                defaultRpcSetting.isDefault = true;
                result.push(defaultRpcSetting);

                if (angular.isArray(options.extendRpcServers)) {
                    for (var i = 0; i < options.extendRpcServers.length; i++) {
                        var rpcSetting = cloneRpcSetting(options.extendRpcServers[i]);
                        rpcSetting.rpcId = options.extendRpcServers[i].rpcId;
                        rpcSetting.isDefault = false;
                        result.push(rpcSetting);
                    }
                }

                var displayOrder = this.getRPCListDisplayOrder();

                if (displayOrder === 'recentlyUsed') {
                    // Do Nothing
                } else if (displayOrder === 'rpcAlias') {
                    result.sort(function (rpc1, rpc2) {
                        return String.naturalCompare(rpc1.rpcAlias, rpc2.rpcAlias);
                    });
                }

                return result;
            },
            importAllOptions: function (options) {
                var finalOptions = angular.copy(ariaNgDefaultOptions);

                for (var key in options) {
                    if (!options.hasOwnProperty(key) || !finalOptions.hasOwnProperty(key)) {
                        continue;
                    }

                    if (angular.isObject(options[key]) || angular.isArray(options[key])) {
                        continue;
                    }

                    finalOptions[key] = options[key];
                }

                if (angular.isArray(options.extendRpcServers)) {
                    for (var i = 0; i < options.extendRpcServers.length; i++) {
                        var rpcSetting = options.extendRpcServers[i];
                        var finalRpcSetting = createNewRpcSetting();

                        for (var key in rpcSetting) {
                            if (!rpcSetting.hasOwnProperty(key) || !finalRpcSetting.hasOwnProperty(key)) {
                                continue;
                            }

                            if (angular.isObject(rpcSetting[key]) || angular.isArray(rpcSetting[key])) {
                                continue;
                            }

                            finalRpcSetting[key] = rpcSetting[key];
                        }

                        finalOptions.extendRpcServers.push(finalRpcSetting);
                    }
                }

                setOptions(finalOptions);
            },
            exportAllOptions: function () {
                var options = angular.extend({}, ariaNgDefaultOptions, getOptions());

                return options;
            },
            getAllSessionOptions: function () {
                return angular.copy(sessionSettings);
            },
            isInsecureProtocolDisabled: function () {
                return isInsecureProtocolDisabled();
            },
            getLanguage: function () {
                return getOption('language');
            },
            setLanguage: function (value) {
                if (!ariaNgLanguages[value]) {
                    return false;
                }

                setOption('language', value);
                return true;
            },
            isEnableDebugMode: function () {
                return sessionSettings.debugMode;
            },
            setDebugMode: function (value) {
                sessionSettings.debugMode = value;
                ariaNgLogService.setEnableDebugLog(value);
            },
            getTitle: function () {
                return getOption('title');
            },
            setTitle: function (value) {
                setOption('title', value);
            },
            getBrowserNotification: function () {
                return getOption('browserNotification');
            },
            setBrowserNotification: function (value) {
                setOption('browserNotification', value);
            },
            getTitleRefreshInterval: function () {
                return getOption('titleRefreshInterval');
            },
            setTitleRefreshInterval: function (value) {
                setOption('titleRefreshInterval', Math.max(parseInt(value), 0));
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
            getRPCListDisplayOrder: function () {
                return getOption('rpcListDisplayOrder');
            },
            setRPCListDisplayOrder: function (value) {
                setOption('rpcListDisplayOrder', value);
            },
            getAfterCreatingNewTask: function () {
                return getOption('afterCreatingNewTask');
            },
            setAfterCreatingNewTask: function (value) {
                setOption('afterCreatingNewTask', value);
            },
            getRemoveOldTaskAfterRetrying: function () {
                return getOption('removeOldTaskAfterRetrying');
            },
            setRemoveOldTaskAfterRetrying: function (value) {
                setOption('removeOldTaskAfterRetrying', value);
            },
            getConfirmTaskRemoval: function () {
                return getOption('confirmTaskRemoval');
            },
            setConfirmTaskRemoval: function (value) {
                setOption('confirmTaskRemoval', value);
            },
            getAfterRetryingTask: function () {
                return getOption('afterRetryingTask');
            },
            setAfterRetryingTask: function (value) {
                setOption('afterRetryingTask', value);
            },
            getCurrentRpcDisplayName: function () {
                var options = getOptions();

                if (options.rpcAlias) {
                    return options.rpcAlias;
                }

                return options.rpcHost + ':' + options.rpcPort;
            },
            getCurrentRpcUrl: function () {
                var options = getOptions();
                var protocol = options.protocol;
                var rpcHost = options.rpcHost;
                var rpcPort = options.rpcPort;
                var rpcInterface = options.rpcInterface;

                return protocol + '://' + rpcHost + ':' + rpcPort + '/' + rpcInterface;
            },
            getCurrentRpcHttpMethod: function () {
                return getOption('httpMethod');
            },
            isCurrentRpcUseWebSocket: function (protocol) {
                if (!protocol) {
                    var options = getOptions();
                    protocol = options.protocol;
                }

                return protocol === 'ws' || protocol === 'wss';
            },
            getCurrentRpcSecret: function () {
                var value = getOption('secret');
                return (value ? ariaNgCommonService.base64Decode(value) : value);
            },
            addNewRpcSetting: function () {
                var options = getOptions();

                if (!angular.isArray(options.extendRpcServers)) {
                    options.extendRpcServers = [];
                }

                var newRpcSetting = createNewRpcSetting();
                options.extendRpcServers.push(newRpcSetting);

                setOptions(options);

                return newRpcSetting;
            },
            updateRpcSetting: function (setting, field) {
                if (!setting) {
                    return setting;
                }

                var updatedSetting = cloneRpcSetting(setting);

                if (angular.isUndefined(updatedSetting[field])) {
                    return setting;
                }

                var value = updatedSetting[field];

                if (field === 'rpcPort') {
                    value = Math.max(parseInt(value), 0);
                } else if (field === 'secret') {
                    if (value) {
                        value = ariaNgCommonService.base64Encode(value);
                    }
                }

                if (setting.isDefault) {
                    setOption(field, value);

                    return setting;
                } else {
                    var options = getOptions();

                    if (!angular.isArray(options.extendRpcServers)) {
                        return setting;
                    }

                    for (var i = 0; i < options.extendRpcServers.length; i++) {
                        if (options.extendRpcServers[i].rpcId === setting.rpcId) {
                            options.extendRpcServers[i][field] = value;
                            break;
                        }
                    }

                    setOptions(options);

                    return setting;
                }
            },
            removeRpcSetting: function (setting) {
                var options = getOptions();

                if (!angular.isArray(options.extendRpcServers)) {
                    return setting;
                }

                for (var i = 0; i < options.extendRpcServers.length; i++) {
                    if (options.extendRpcServers[i].rpcId === setting.rpcId) {
                        options.extendRpcServers.splice(i, 1);
                        break;
                    }
                }

                setOptions(options);

                return setting;
            },
            setDefaultRpcSetting: function (setting, params) {
                params = angular.extend({
                    keepCurrent: true,
                    forceSet: false
                }, params);

                var options = getOptions();
                var currentSetting = cloneRpcSetting(options);
                currentSetting.rpcId = ariaNgCommonService.generateUniqueId();

                if (!angular.isArray(options.extendRpcServers)) {
                    options.extendRpcServers = [];
                }

                var newDefaultSetting = null;

                for (var i = 0; i < options.extendRpcServers.length; i++) {
                    if (options.extendRpcServers[i].rpcId === setting.rpcId) {
                        newDefaultSetting = cloneRpcSetting(options.extendRpcServers[i]);
                        options.extendRpcServers.splice(i, 1);
                        break;
                    }
                }

                if (params.forceSet) {
                    newDefaultSetting = cloneRpcSetting(setting);

                    if (newDefaultSetting.secret) {
                        newDefaultSetting.secret = ariaNgCommonService.base64Encode(newDefaultSetting.secret);
                    }
                }

                if (newDefaultSetting) {
                    if (params.keepCurrent) {
                        options.extendRpcServers.splice(0, 0, currentSetting);
                    }

                    options = angular.extend(options, newDefaultSetting);
                }

                setOptions(options);

                return setting;
            },
            isRpcSettingEqualsDefault: function (setting) {
                if (!setting) {
                    return false;
                }

                var options = this.getAllOptions();

                if (options.rpcHost !== setting.rpcHost) {
                    return false;
                }

                if (options.rpcPort !== setting.rpcPort) {
                    return false;
                }

                if (options.rpcInterface !== setting.rpcInterface) {
                    return false;
                }

                if (options.protocol !== setting.protocol) {
                    return false;
                }

                if (options.httpMethod !== setting.httpMethod) {
                    return false;
                }

                if (options.secret !== setting.secret) {
                    return false;
                }

                return true;
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
            resetSettings: function () {
                clearAll();
            },
            onApplicationCacheUpdated: function (callback) {
                if (!callback) {
                    return;
                }

                onAppCacheUpdatedCallbacks.push(callback);
            },
            onFirstAccess: function (callback) {
                if (!callback) {
                    return;
                }

                onFirstVisitCallbacks.push(callback);
            }
        };
    }]);
}());
