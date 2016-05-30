(function () {
    'use strict';

    angular.module('ariaNg').controller('MainController', ['$rootScope', '$scope', '$route', '$interval', 'aria2RpcService', 'ariaNgSettingService', 'utils', function ($rootScope, $scope, $route, $interval, aria2RpcService, ariaNgSettingService, utils) {
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

        $scope.startTask = function () {
            var gids = $rootScope.taskContext.getSelectedTaskIds();

            if (!gids || gids.length < 1) {
                return;
            }

            $rootScope.loadPromise = aria2RpcService.unpauseMulti({
                gids: gids,
                callback: function (result) {
                    $route.reload();
                }
            });
        };

        $scope.pauseTask = function () {
            var gids = $rootScope.taskContext.getSelectedTaskIds();

            if (!gids || gids.length < 1) {
                return;
            }

            $rootScope.loadPromise = aria2RpcService.forcePauseMulti({
                gids: gids,
                callback: function (result) {
                    $route.reload();
                }
            });
        };

        $scope.removeTask = function () {
            var gids = $rootScope.taskContext.getSelectedTaskIds();

            if (!gids || gids.length < 1) {
                return;
            }

            utils.confirm('Confirm Remove', 'Are you sure you want to remove the selected task?', 'warning', function () {

            });
        };

        $scope.clearFinishedTasks = function () {
            utils.confirm('Confirm Clear', 'Are you sure you want to clear finished tasks?', 'warning', function () {

            });
        };

        $scope.isTaskSelected = function () {
            return $rootScope.taskContext.getSelectedTaskIds().length > 0;
        };

        $scope.isStartableTaskSelected = function () {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();

            if (selectedTasks.length < 1) {
                return false;
            }

            for (var i = 0; i < selectedTasks.length; i++) {
                if (selectedTasks[i].status == 'paused') {
                    return true;
                }
            }

            return false;
        };

        $scope.isPausableTaskSelected = function () {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();

            if (selectedTasks.length < 1) {
                return false;
            }

            for (var i = 0; i < selectedTasks.length; i++) {
                if (selectedTasks[i].status == 'active') {
                    return true;
                }
            }

            return false;
        };

        $scope.selectAllTasks = function () {
            $rootScope.taskContext.selectAll();
        };

        $scope.changeDisplayOrder = function (type, autoSetReverse) {
            var oldType = utils.parseOrderType(ariaNgSettingService.getDisplayOrder());
            var newType = utils.parseOrderType(type);

            if (autoSetReverse && newType.type == oldType.type) {
                newType.reverse = !oldType.reverse;
            }

            ariaNgSettingService.setDisplayOrder(newType.getValue());
        };

        $scope.isSetDisplayOrder = function (type) {
            var orderType = utils.parseOrderType(ariaNgSettingService.getDisplayOrder());
            var targetType = utils.parseOrderType(type);

            return orderType.equals(targetType);
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
