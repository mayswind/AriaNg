(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2StatusController', ['$rootScope', '$scope', 'ariaNgCommonService', 'aria2SettingService', function ($rootScope, $scope, ariaNgCommonService, aria2SettingService) {
        $rootScope.loadPromise = (function () {
            return aria2SettingService.getAria2Status(function (result) {
                $scope.aria2Status = result;
            });
        })();

        $scope.saveSession = function () {
            return aria2SettingService.saveSession(function (result) {
                if (result == 'OK') {
                    ariaNgCommonService.showOperationSucceeded('Session has been saved successfully.');
                } else {
                    ariaNgCommonService.showError('Failed to save session.');
                }
            });
        };

        $scope.shutdown = function () {
            ariaNgCommonService.confirm('Confirm Shutdown', 'Are you sure you want to shutdown aria2?', 'warning', function (status) {
                return aria2SettingService.shutdown(function (result) {
                    if (result == 'OK') {
                        ariaNgCommonService.showOperationSucceeded('Aria2 has been shutdown successfully.');
                    } else {
                        ariaNgCommonService.showError('Failed to shutdown aria2.');
                    }
                });
            }, true);
        };
    }]);
})();
