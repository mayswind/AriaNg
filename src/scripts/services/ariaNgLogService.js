(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLogService', ['$log', 'ariaNgConstants', function ($log, ariaNgConstants) {
        var enableDebugLog = false;
        var cachedDebugLogs = [];

        var createNewCacheLogItem = function (msg, level, obj) {
            return {
                time: new Date(),
                level: level,
                content: msg,
                attachment: obj
            };
        };

        var pushLogToCache = function (msg, level, obj) {
            if (!enableDebugLog) {
                return;
            }

            if (cachedDebugLogs.length >= ariaNgConstants.cachedDebugLogsLimit) {
                cachedDebugLogs.shift();
            }

            cachedDebugLogs.push(createNewCacheLogItem(msg, level, obj));
        };

        return {
            setEnableDebugLog: function (value) {
                enableDebugLog = value;
            },
            debug: function (msg, obj) {
                if (enableDebugLog) {
                    if (obj) {
                        $log.debug('[AriaNg Debug]' + msg, obj);
                    } else {
                        $log.debug('[AriaNg Debug]' + msg);
                    }

                    pushLogToCache(msg, 'DEBUG', obj);
                }
            },
            info: function (msg, obj) {
                if (obj) {
                    $log.info('[AriaNg Info]' + msg, obj);
                } else {
                    $log.info('[AriaNg Info]' + msg);
                }

                pushLogToCache(msg, 'INFO', obj);
            },
            warn: function (msg, obj) {
                if (obj) {
                    $log.warn('[AriaNg Warn]' + msg, obj);
                } else {
                    $log.warn('[AriaNg Warn]' + msg);
                }

                pushLogToCache(msg, 'WARN', obj);
            },
            error: function (msg, obj) {
                if (obj) {
                    $log.error('[AriaNg Error]' + msg, obj);
                } else {
                    $log.error('[AriaNg Error]' + msg);
                }

                pushLogToCache(msg, 'ERROR', obj);
            },
            getDebugLogs: function () {
                if (enableDebugLog) {
                    return cachedDebugLogs;
                } else {
                    return [];
                }
            }
        };
    }]);
}());
