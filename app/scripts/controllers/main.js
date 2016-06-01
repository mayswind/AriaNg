(function () {
    'use strict';

    angular.module('ariaNg').controller('MainController', ['$rootScope', '$scope', '$route', '$interval', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2TaskService', 'aria2SettingService', function ($rootScope, $scope, $route, $interval, ariaNgCommonService, ariaNgSettingService, aria2TaskService, aria2SettingService) {
        var globalStatRefreshPromise = null;

        var refreshGlobalStat = function () {
            return aria2SettingService.getGlobalStat(function (result) {
                $scope.globalStat = result;
            });
        };

        $scope.isTaskSelected = function () {
            return $rootScope.taskContext.getSelectedTaskIds().length > 0;
        };

        $scope.isSpecifiedTaskSelected = function (status) {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();

            if (selectedTasks.length < 1) {
                return false;
            }

            for (var i = 0; i < selectedTasks.length; i++) {
                if (selectedTasks[i].status == status) {
                    return true;
                }
            }

            return false;
        };

        $scope.changeTasksState = function (state) {
            var gids = $rootScope.taskContext.getSelectedTaskIds();

            if (!gids || gids.length < 1) {
                return;
            }

            var invoke = null;

            if (state == 'start') {
                invoke = aria2TaskService.startTasks;
            } else if (state == 'pause') {
                invoke = aria2TaskService.pauseTasks;
            } else {
                return;
            }

            $rootScope.loadPromise = invoke(gids, function (result) {
                $route.reload();
            });
        };

        $scope.removeTasks = function () {
            var gids = $rootScope.taskContext.getSelectedTaskIds();

            if (!gids || gids.length < 1) {
                return;
            }

            ariaNgCommonService.confirm('Confirm Remove', 'Are you sure you want to remove the selected task?', 'warning', function () {

            });
        };

        $scope.clearFinishedTasks = function () {
            ariaNgCommonService.confirm('Confirm Clear', 'Are you sure you want to clear finished tasks?', 'warning', function () {

            });
        };

        $scope.selectAllTasks = function () {
            $rootScope.taskContext.selectAll();
        };

        $scope.changeDisplayOrder = function (type, autoSetReverse) {
            var oldType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getDisplayOrder());
            var newType = ariaNgCommonService.parseOrderType(type);

            if (autoSetReverse && newType.type == oldType.type) {
                newType.reverse = !oldType.reverse;
            }

            ariaNgSettingService.setDisplayOrder(newType.getValue());
        };

        $scope.isSetDisplayOrder = function (type) {
            var orderType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getDisplayOrder());
            var targetType = ariaNgCommonService.parseOrderType(type);

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

        refreshGlobalStat();
    }]);
})();
