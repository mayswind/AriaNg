(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLogService', ['$log', 'ariaNgConstants', function ($log, ariaNgConstants) {
        var logLevels = {
            DEBUG: 1,
            INFO: 2,
            WARN: 3,
            ERROR: 4
        };
        var logIndex = 0;
        var enableDebugLog = false;
        var cachedDebugLogs = [];

        var createNewCacheLogItem = function (msg, level, obj) {
            return {
                id: ++logIndex,
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
            compareLogLevel: function (level1, level2) {
                var level1Val = logLevels[level1];
                var level2Val = logLevels[level2];

                if (!level1Val) {
                    level1Val = 0;
                }

                if (!level2Val) {
                    level2Val = 0;
                }

                if (level1Val > level2Val) {
                    return 1;
                } else if (level1Val < level2Val) {
                    return -1;
                } else {
                    return 0;
                }
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
            },
            clearDebugLogs: function () {
                logIndex = 0;
                cachedDebugLogs.length = 0;
            }
        };
    }]);
}());
