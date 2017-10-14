(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLogService', ['$log', 'ariaNgSettingService', function ($log, ariaNgSettingService) {
        return {
            debug: function (msg, obj) {
                if (ariaNgSettingService.isEnableDebugMode()) {
                    if (obj) {
                        $log.debug('[AriaNg Debug]' + msg, obj);
                    } else {
                        $log.debug('[AriaNg Debug]' + msg);
                    }
                }
            },
            info: function (msg, obj) {
                if (obj) {
                    $log.info('[AriaNg Info]' + msg, obj);
                } else {
                    $log.info('[AriaNg Info]' + msg);
                }
            },
            warn: function (msg, obj) {
                if (obj) {
                    $log.warn('[AriaNg Warn]' + msg, obj);
                } else {
                    $log.warn('[AriaNg Warn]' + msg);
                }
            },
            error: function (msg, obj) {
                if (obj) {
                    $log.error('[AriaNg Error]' + msg, obj);
                } else {
                    $log.error('[AriaNg Error]' + msg);
                }
            }
        };
    }]);
}());
