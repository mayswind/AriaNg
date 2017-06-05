(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2StatusController', ['$rootScope', '$scope', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2SettingService', function ($rootScope, $scope, ariaNgCommonService, ariaNgSettingService, aria2SettingService) {
        $scope.context = {
            host: ariaNgSettingService.getCurrentRpcUrl(),
            status: 'Connecting',
            serverStatus: null
        };

        $scope.saveSession = function () {
            return aria2SettingService.saveSession(function (response) {
                if (response.success && response.data === 'OK') {
                    ariaNgCommonService.showOperationSucceeded('Session has been saved successfully.');
                }
            });
        };

        $scope.shutdown = function () {
            ariaNgCommonService.confirm('Confirm Shutdown', 'Are you sure you want to shutdown aria2?', 'warning', function (status) {
                return aria2SettingService.shutdown(function (response) {
                    if (response.success && response.data === 'OK') {
                        ariaNgCommonService.showOperationSucceeded('Aria2 has been shutdown successfully.');
                    }
                });
            }, true);
        };

        $rootScope.loadPromise = (function () {
            return aria2SettingService.getAria2Status(function (response) {
                if (response.success) {
                    $scope.context.status = 'Connected';
                    $scope.context.serverStatus = response.data;
                } else {
                    $scope.context.status = 'Not Connected';
                }
            });
        })();
    }]);
}());
