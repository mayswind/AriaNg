(function () {
    'use strict';

    angular.module('ariaNg').controller('MainController', ['$scope', '$interval', 'aria2RpcService', 'ariaNgSettingService', function ($scope, $interval, aria2RpcService, ariaNgSettingService) {
        var processStatResult = function (stat) {
            var activeCount = parseInt(stat.numActive);
            var waitingCount = parseInt(stat.numWaiting);
            var totalRunningCount = activeCount + waitingCount;

            stat.totalRunningCount = totalRunningCount;
        };

        $scope.changeDisplayOrder = function (type) {
            ariaNgSettingService.setDisplayOrder(type);
        };

        $scope.isSetDisplayOrder = function (type) {
            return ariaNgSettingService.getDisplayOrder() === type;
        };

        $interval(function () {
            aria2RpcService.getGlobalStat({
                callback: function (result) {
                    if (result) {
                        processStatResult(result);
                    }

                    $scope.globalStat = result;
                }
            });
        }, ariaNgSettingService.getGlobalStatRefreshInterval());
    }]);
})();
