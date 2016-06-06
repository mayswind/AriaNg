(function () {
    'use strict';

    angular.module('ariaNg').controller('TaskDetailController', ['$rootScope', '$scope', '$routeParams', '$interval', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2TaskService', 'aria2SettingService', function ($rootScope, $scope, $routeParams, $interval, ariaNgCommonService, ariaNgSettingService, aria2TaskService, aria2SettingService) {
        var tabOrders = ['overview', 'blocks', 'filelist', 'btpeers'];
        var downloadTaskRefreshPromise = null;

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
            return aria2TaskService.getBtTaskPeers(task.gid, function (result) {
                if (!ariaNgCommonService.extendArray(result, $scope.peers, 'peerId')) {
                    $scope.peers = result;
                }

                $scope.healthPercent = aria2TaskService.estimateHealthPercentFromPeers(task, $scope.peers);
            }, silent);
        };

        var refreshDownloadTask = function (silent) {
            return aria2TaskService.getTaskStatus($routeParams.gid, function (result) {
                if (result.status == 'active' && result.bittorrent) {
                    refreshBtPeers(result, true);
                } else {
                    if (tabOrders.indexOf('btpeers') >= 0) {
                        tabOrders.splice(tabOrders.indexOf('btpeers'), 1);
                    }
                }

                if (!$scope.task || $scope.task.status != result.status) {
                    $scope.availableOptions = getAvailableOptions(result.status, !!result.bittorrent);
                }

                $scope.task = ariaNgCommonService.copyObjectTo(result, $scope.task);

                $rootScope.taskContext.list = [$scope.task];
                $rootScope.taskContext.selected = {};
                $rootScope.taskContext.selected[$scope.task.gid] = true;
            }, silent);
        };

        $scope.context = {
            currentTab: 'overview'
        };

        $scope.healthPercent = 0;
        $scope.availableOptions = [];

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

            return aria2TaskService.selectTaskFile(gid, selectedFileIndex, function () {
                refreshDownloadTask(false);
            });
        };

        $scope.loadTaskOption = function (task) {
            $rootScope.loadPromise = aria2TaskService.getTaskOptions(task.gid, function (result) {
                $scope.options = result;
            });
        };

        $scope.setOption = function (key, value, optionStatus) {
            return aria2TaskService.setTaskOption($scope.task.gid, key, value, function (result) {
                if (result == 'OK') {
                    optionStatus.setSuccess();
                } else {
                    optionStatus.setFailed();
                }
            });
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
