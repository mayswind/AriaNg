(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLogService', ['$log', 'ariaNgSettingService', function ($log, ariaNgSettingService) {
        return {
            debug: function (msg, obj) {
                if (ariaNgSettingService.isEnableDebugMode()) {
                    $log.debug('[AriaNg Debug]' + msg, obj);
                }
            },
            info: function (msg, obj) {
                $log.info('[AriaNg Info]' + msg, obj);
            },
            warn: function (msg, obj) {
                $log.warn('[AriaNg Warn]' + msg, obj);
            },
            error: function (msg, obj) {
                $log.error('[AriaNg Error]' + msg, obj);
            }
        };
    }]);
}());
