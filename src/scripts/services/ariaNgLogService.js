(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLogService', ['$log', 'moment', 'ariaNgConstants', 'ariaNgSettingService', function ($log, moment, ariaNgConstants, ariaNgSettingService) {
        var cachedDebugLogs = [];

        var createNewCacheLogItem = function (msg, level, obj) {
            return {
                time: moment(),
                level: level,
                content: msg,
                attachment: obj
            };
        };

        var pushLogToCache = function (msg, level, obj) {
            if (!ariaNgSettingService.isEnableDebugMode()) {
                return;
            }

            if (cachedDebugLogs.length >= ariaNgConstants.cachedDebugLogsLimit) {
                cachedDebugLogs.shift();
            }

            cachedDebugLogs.push(createNewCacheLogItem(msg, level, obj));
        };

        return {
            debug: function (msg, obj) {
                if (ariaNgSettingService.isEnableDebugMode()) {
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
                if (ariaNgSettingService.isEnableDebugMode()) {
                    return cachedDebugLogs;
                } else {
                    return [];
                }
            }
        };
    }]);
}());
