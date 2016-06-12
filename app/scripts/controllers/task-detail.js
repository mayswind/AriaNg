(function () {
    'use strict';

    angular.module('ariaNg').controller('TaskDetailController', ['$rootScope', '$scope', '$routeParams', '$interval', 'aria2RpcErrors', 'ariaNgCommonService', 'ariaNgSettingService', 'ariaNgMonitorService', 'aria2TaskService', 'aria2SettingService', function ($rootScope, $scope, $routeParams, $interval, aria2RpcErrors, ariaNgCommonService, ariaNgSettingService, ariaNgMonitorService, aria2TaskService, aria2SettingService) {
        var tabOrders = ['overview', 'blocks', 'filelist', 'btpeers'];
        var downloadTaskRefreshPromise = null;
        var pauseDownloadTaskRefresh = false;

        var getAvailableOptions = function (status, isBittorrent) {
            var keys = aria2SettingService.getAvailableTaskOptionKeys(status, isBittorrent);

            if (!keys) {
                return;
            }

            var options = [];
            ariaNgCommonService.pushArrayTo(options, aria2SettingService.getSpecifiedOptions(keys.readwrite));
            ariaNgCommonService.pushArrayTo(options, aria2SettingService.getSpecifiedOptions(keys.readonly, true));

            return options;
        };

        var refreshBtPeers = function (task, silent) {
            return aria2TaskService.getBtTaskPeers(task.gid, function (response) {
                if (!response.success) {
                    return;
                }

                var peers = response.data;
                peers.push(aria2TaskService.createLocalPeerFromTask(task));

                if (!ariaNgCommonService.extendArray(peers, $scope.peers, 'peerId')) {
                    $scope.peers = peers;
                }

                $scope.context.healthPercent = aria2TaskService.estimateHealthPercentFromPeers(task, $scope.peers);
            }, silent);
        };

        var refreshDownloadTask = function (silent) {
            if (pauseDownloadTaskRefresh) {
                return;
            }

            return aria2TaskService.getTaskStatus($routeParams.gid, function (response) {
                if (!response.success) {
                    if (response.data.message == aria2RpcErrors.Unauthorized.message) {
                        $interval.cancel(downloadTaskRefreshPromise);
                    }

                    return;
                }

                var task = response.data;

                if (task.status == 'active' && task.bittorrent) {
                    refreshBtPeers(task, true);
                } else {
                    if (tabOrders.indexOf('btpeers') >= 0) {
                        tabOrders.splice(tabOrders.indexOf('btpeers'), 1);
                    }
                }

                if (!$scope.task || $scope.task.status != task.status) {
                    $scope.context.availableOptions = getAvailableOptions(task.status, !!task.bittorrent);
                }

                $scope.task = ariaNgCommonService.copyObjectTo(task, $scope.task);

                $rootScope.taskContext.list = [$scope.task];
                $rootScope.taskContext.selected = {};
                $rootScope.taskContext.selected[$scope.task.gid] = true;

                ariaNgMonitorService.recordStat(task.gid, task);
            }, silent);
        };

        $scope.context = {
            currentTab: 'overview',
            healthPercent: 0,
            statusData: ariaNgMonitorService.getEmptyStatsData($routeParams.gid),
            availableOptions: []
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

        $scope.setSelectedFile = function () {
            if (!$scope.task || !$scope.task.files) {
                return;
            }

            var gid = $scope.task.gid;
            var selectedFileIndex = [];

            for (var i = 0; i < $scope.task.files.length; i++) {
                var file = $scope.task.files[i];

                if (file && file.selected) {
                    selectedFileIndex.push(file.index);
                }
            }

            pauseDownloadTaskRefresh = true;

            return aria2TaskService.selectTaskFile(gid, selectedFileIndex, function (response) {
                pauseDownloadTaskRefresh = false;

                if (response.success) {
                    refreshDownloadTask(false);
                }
            }, true);
        };

        $scope.changePeerListDisplayOrder = function (type, autoSetReverse) {
            var oldType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getPeerListDisplayOrder());
            var newType = ariaNgCommonService.parseOrderType(type);

            if (autoSetReverse && newType.type == oldType.type) {
                newType.reverse = !oldType.reverse;
            }

            ariaNgSettingService.setPeerListDisplayOrder(newType.getValue());
        };

        $scope.isSetPeerListDisplayOrder = function (type) {
            var orderType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getPeerListDisplayOrder());
            var targetType = ariaNgCommonService.parseOrderType(type);

            return orderType.equals(targetType);
        };

        $scope.getPeerListOrderType = function () {
            return ariaNgSettingService.getPeerListDisplayOrder();
        };

        $scope.loadTaskOption = function (task) {
            $rootScope.loadPromise = aria2TaskService.getTaskOptions(task.gid, function (response) {
                if (response.success) {
                    $scope.options = response.data;
                }
            });
        };

        $scope.setOption = function (key, value, optionStatus) {
            return aria2TaskService.setTaskOption($scope.task.gid, key, value, function (response) {
                if (response.success && response.data == 'OK') {
                    optionStatus.setSuccess();
                } else {
                    optionStatus.setFailed();
                }
            }, true);
        };

        if (ariaNgSettingService.getDownloadTaskRefreshInterval() > 0) {
            downloadTaskRefreshPromise = $interval(function () {
                refreshDownloadTask(true);
            }, ariaNgSettingService.getDownloadTaskRefreshInterval());
        }

        $scope.$on('$destroy', function () {
            if (downloadTaskRefreshPromise) {
                $interval.cancel(downloadTaskRefreshPromise);
            }
        });

        $rootScope.loadPromise = refreshDownloadTask(false);
    }]);
})();
