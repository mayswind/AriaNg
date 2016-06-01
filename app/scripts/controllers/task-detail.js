(function () {
    'use strict';

    angular.module('ariaNg').controller('TaskDetailController', ['$rootScope', '$scope', '$routeParams', '$interval', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2TaskService', function ($rootScope, $scope, $routeParams, $interval, ariaNgCommonService, ariaNgSettingService, aria2TaskService) {
        var tabOrders = ['overview', 'blocks', 'filelist', 'btpeers'];
        var downloadTaskRefreshPromise = null;

        $scope.context = {
            currentTab: 'overview'
        };

        $scope.healthPercent = 0;

        var refreshBtPeers = function (task) {
            return aria2TaskService.getBtTaskPeers(task.gid, function (result) {
                if (!ariaNgCommonService.extendArray(result, $scope.peers, 'peerId')) {
                    $scope.peers = result;
                }

                $scope.healthPercent = aria2TaskService.estimateHealthPercentFromPeers(task, $scope.peers);
            });
        };

        var refreshDownloadTask = function () {
            return aria2TaskService.getTaskStatus($routeParams.gid, function (result) {
                if (result.status == 'active' && result.bittorrent) {
                    refreshBtPeers(result);
                } else {
                    if (tabOrders.indexOf('btpeers') >= 0) {
                        tabOrders.splice(tabOrders.indexOf('btpeers'), 1);
                    }
                }

                $scope.task = ariaNgCommonService.copyObjectTo(result, $scope.task);

                $rootScope.taskContext.list = [$scope.task];
                $rootScope.taskContext.selected = {};
                $rootScope.taskContext.selected[$scope.task.gid] = true;
            });
        };

        $rootScope.swipeActions.extentLeftSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex < tabOrders.length - 1) {
                $scope.context.currentTab = tabOrders[tabIndex + 1];
                return true;
            } else {
                return false;
            }
        };

        $rootScope.swipeActions.extentRightSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex > 0) {
                $scope.context.currentTab = tabOrders[tabIndex - 1];
                return true;
            } else {
                return false;
            }
        };

        $scope.loadTaskOption = function (task) {
            $rootScope.loadPromise = aria2TaskService.getTaskOption(task.gid, function (result) {
                $scope.options = result;
            });
        };

        $scope.changeFileListDisplayOrder = function (type, autoSetReverse) {
            var oldType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getFileListDisplayOrder());
            var newType = ariaNgCommonService.parseOrderType(type);

            if (autoSetReverse && newType.type == oldType.type) {
                newType.reverse = !oldType.reverse;
            }

            ariaNgSettingService.setFileListDisplayOrder(newType.getValue());
        };

        $scope.isSetFileListDisplayOrder = function (type) {
            var orderType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getFileListDisplayOrder());
            var targetType = ariaNgCommonService.parseOrderType(type);

            return orderType.equals(targetType);
        };

        $scope.getFileListOrderType = function () {
            return ariaNgSettingService.getFileListDisplayOrder();
        };

        if (ariaNgSettingService.getDownloadTaskRefreshInterval() > 0) {
            downloadTaskRefreshPromise = $interval(function () {
                refreshDownloadTask();
            }, ariaNgSettingService.getDownloadTaskRefreshInterval());
        }

        $scope.$on('$destroy', function () {
            if (downloadTaskRefreshPromise) {
                $interval.cancel(downloadTaskRefreshPromise);
            }
        });

        $rootScope.loadPromise = refreshDownloadTask();
    }]);
})();
