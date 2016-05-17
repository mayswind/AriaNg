(function () {
    'use strict';

    angular.module('ariaNg').controller('MainController', ['$scope', '$interval', 'aria2RpcService', 'ariaNgSettingService', function ($scope, $interval, aria2RpcService, ariaNgSettingService) {
        var globalStatRefreshPromise = null;

        var processStatResult = function (stat) {
            var activeCount = parseInt(stat.numActive);
            var waitingCount = parseInt(stat.numWaiting);
            var totalRunningCount = activeCount + waitingCount;

            stat.totalRunningCount = totalRunningCount;
        };

        var refreshGlobalStat = function () {
            aria2RpcService.getGlobalStat({
                callback: function (result) {
                    if (result) {
                        processStatResult(result);
                    }

                    $scope.globalStat = result;
                }
            });
        };

        refreshGlobalStat();

        $scope.changeDisplayOrder = function (type) {
            ariaNgSettingService.setDisplayOrder(type);
        };

        $scope.isSetDisplayOrder = function (type) {
            return ariaNgSettingService.getDisplayOrder() === type;
        };

        if (ariaNgSettingService.getGlobalStatRefreshInterval() > 0) {
            globalStatRefreshPromise = $interval(function () {
                refreshGlobalStat();
            }, ariaNgSettingService.getGlobalStatRefreshInterval());
        }

        $scope.$on('$destroy', function () {
            if (globalStatRefreshPromise) {
                $interval.cancel(globalStatRefreshPromise);
            }
        });
    }]);
})();
