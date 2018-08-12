(function () {
    'use strict';

    angular.module('ariaNg').controller('AriaNgDebugController', ['$rootScope', '$scope', '$location', '$timeout', 'ariaNgConstants', 'ariaNgLocalizationService', 'ariaNgLogService', 'ariaNgSettingService', function ($rootScope, $scope, $location, $timeout, ariaNgConstants, ariaNgLocalizationService, ariaNgLogService, ariaNgSettingService) {
        $scope.logMaxCount = ariaNgConstants.cachedDebugLogsLimit;
        $scope.currentLog = null;

        $scope.enableDebugMode = function () {
            return ariaNgSettingService.isEnableDebugMode();
        };

        $scope.reloadLogs = function () {
            $scope.logs = ariaNgLogService.getDebugLogs().slice();
        };

        $scope.showLogDetail = function (log) {
            $scope.currentLog = log;
            angular.element('#log-detail-modal').modal();
        };

        $('#log-detail-modal').on('hide.bs.modal', function (e) {
            $scope.currentLog = null;
        });

        $rootScope.loadPromise = $timeout(function () {
            if (!ariaNgSettingService.isEnableDebugMode()) {
                ariaNgLocalizationService.showError('Access Denied!', function () {
                    if (!ariaNgSettingService.isEnableDebugMode()) {
                        $location.path('/settings/ariang');
                    }
                });
                return;
            }

            $scope.reloadLogs();
        }, 100);
    }]);
}());
