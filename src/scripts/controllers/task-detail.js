(function () {
    'use strict';

    angular.module('ariaNg').controller('TaskDetailController', ['$rootScope', '$scope', '$routeParams', '$interval', 'aria2RpcErrors', 'ariaNgFileTypes', 'ariaNgCommonService', 'ariaNgSettingService', 'ariaNgMonitorService', 'aria2TaskService', 'aria2SettingService', function ($rootScope, $scope, $routeParams, $interval, aria2RpcErrors, ariaNgFileTypes, ariaNgCommonService, ariaNgSettingService, ariaNgMonitorService, aria2TaskService, aria2SettingService) {
        var tabOrders = ['overview', 'blocks', 'filelist', 'btpeers'];
        var downloadTaskRefreshPromise = null;
        var pauseDownloadTaskRefresh = false;

        var getAvailableOptions = function (status, isBittorrent) {
            var keys = aria2SettingService.getAvailableTaskOptionKeys(status, isBittorrent);

            return aria2SettingService.getSpecifiedOptions(keys, {
                disableRequired: true
            });
        };

        var processTask = function (task) {
            if (!task) {
                return;
            }

            if (task.status !== 'active' || !task.bittorrent) {
                if (tabOrders.indexOf('btpeers') >= 0) {
                    tabOrders.splice(tabOrders.indexOf('btpeers'), 1);
                }
            }

            if (!$scope.task || $scope.task.status !== task.status) {
                $scope.context.availableOptions = getAvailableOptions(task.status, !!task.bittorrent);
            }

            $scope.task = ariaNgCommonService.copyObjectTo(task, $scope.task);

            $rootScope.taskContext.list = [$scope.task];
            $rootScope.taskContext.selected = {};
            $rootScope.taskContext.selected[$scope.task.gid] = true;

            ariaNgMonitorService.recordStat(task.gid, task);
        };

        var processPeers = function (peers) {
            if (!peers) {
                return;
            }

            if (!ariaNgCommonService.extendArray(peers, $scope.context.btPeers, 'peerId')) {
                $scope.context.btPeers = peers;
            }

            $scope.context.healthPercent = aria2TaskService.estimateHealthPercentFromPeers($scope.task, $scope.context.btPeers);
        };

        var requireBtPeers = function (task) {
            return (task && task.bittorrent && task.status === 'active');
        };

        var refreshDownloadTask = function (silent) {
            if (pauseDownloadTaskRefresh) {
                return;
            }

            var processError = function (message) {
                $interval.cancel(downloadTaskRefreshPromise);
            };

            var includeLocalPeer = true;

            if (!$scope.task) {
                return aria2TaskService.getTaskStatus($routeParams.gid, function (response) {
                    if (!response.success) {
                        return processError(response.data.message);
                    }

                    var task = response.data;
                    processTask(task);

                    if (requireBtPeers(task)) {
                        aria2TaskService.getBtTaskPeers(task, function (response) {
                            if (response.success) {
                                processPeers(response.data);
                            }
                        }, silent, includeLocalPeer);
                    }
                }, silent);
            } else {
                return aria2TaskService.getTaskStatusAndBtPeers($routeParams.gid, function (response) {
                    if (!response.success) {
                        return processError(response.data.message);
                    }

                    processTask(response.task);
                    processPeers(response.peers);
                }, silent, requireBtPeers($scope.task), includeLocalPeer);
            }
        };

        var setSelectFiles = function (silent) {
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
            }, silent);
        };

        $scope.context = {
            currentTab: 'overview',
            isEnableSpeedChart: ariaNgSettingService.getDownloadTaskRefreshInterval() > 0,
            showChooseFilesToolbar: false,
            btPeers: [],
            healthPercent: 0,
            collapseTrackers: true,
            statusData: ariaNgMonitorService.getEmptyStatsData($routeParams.gid),
            availableOptions: [],
            options: []
        };

        $scope.changeTab = function (tabName) {
            if (tabName === 'settings') {
                $scope.loadTaskOption($scope.task);
            }

            $scope.context.currentTab = tabName;
        };

        $rootScope.swipeActions.extentLeftSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex < tabOrders.length - 1) {
                $scope.changeTab(tabOrders[tabIndex + 1]);
                return true;
            } else {
                return false;
            }
        };

        $rootScope.swipeActions.extentRightSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex > 0) {
                $scope.changeTab(tabOrders[tabIndex - 1]);
                return true;
            } else {
                return false;
            }
        };

        $scope.changeFileListDisplayOrder = function (type, autoSetReverse) {
            var oldType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getFileListDisplayOrder());
            var newType = ariaNgCommonService.parseOrderType(type);

            if (autoSetReverse && newType.type === oldType.type) {
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

        $scope.showChooseFilesToolbar = function () {
            pauseDownloadTaskRefresh = true;
            $scope.context.showChooseFilesToolbar = true;
        };

        $scope.getSelectedFileCount = function () {
            var count = 0;

            for (var i = 0; i < $scope.task.files.length; i++) {
                count += $scope.task.files[i].selected ? 1 : 0;
            }

            return count;
        };

        $scope.selectFiles = function (type) {
            if (!$scope.task || !$scope.task.files) {
                return;
            }

            for (var i = 0; i < $scope.task.files.length; i++) {
                if (type === 'all') {
                    $scope.task.files[i].selected = true;
                } else if (type === 'none') {
                    $scope.task.files[i].selected = false;
                } else if (type === 'reverse') {
                    $scope.task.files[i].selected = !$scope.task.files[i].selected;
                }
            }
        };

        $scope.chooseSpecifiedFiles = function (type) {
            if (!$scope.task || !$scope.task.files || !ariaNgFileTypes[type]) {
                return;
            }

            var extensions = ariaNgFileTypes[type];
            var fileIndexes = [];
            var isAllSelected = true;

            for (var i = 0; i < $scope.task.files.length; i++) {
                var extension = ariaNgCommonService.getFileExtension($scope.task.files[i].fileName);

                if (extension) {
                    extension = extension.toLowerCase();
                }

                if (extensions.indexOf(extension) >= 0) {
                    fileIndexes.push(i);

                    if (!$scope.task.files[i].selected) {
                        isAllSelected = false;
                    }
                }
            }

            for (var i = 0; i < fileIndexes.length; i++) {
                var index = fileIndexes[i];
                $scope.task.files[index].selected = !isAllSelected;
            }
        };

        $scope.saveChoosedFiles = function () {
            if ($scope.context.showChooseFilesToolbar) {
                $rootScope.loadPromise = setSelectFiles(false);
                $scope.context.showChooseFilesToolbar = false;
            }
        };

        $scope.cancelChooseFiles = function () {
            if ($scope.context.showChooseFilesToolbar) {
                pauseDownloadTaskRefresh = false;
                refreshDownloadTask(true);
                $scope.context.showChooseFilesToolbar = false;
            }
        };

        $scope.setSelectedFile = function () {
            if (!$scope.context.showChooseFilesToolbar) {
                setSelectFiles(true);
            }
        };

        $scope.changePeerListDisplayOrder = function (type, autoSetReverse) {
            var oldType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getPeerListDisplayOrder());
            var newType = ariaNgCommonService.parseOrderType(type);

            if (autoSetReverse && newType.type === oldType.type) {
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
                    $scope.context.options = response.data;
                }
            });
        };

        $scope.setOption = function (key, value, optionStatus) {
            return aria2TaskService.setTaskOption($scope.task.gid, key, value, function (response) {
                if (response.success && response.data === 'OK') {
                    optionStatus.setSuccess();
                } else {
                    optionStatus.setFailed(response.data.message);
                }
            }, true);
        };

        if (ariaNgSettingService.getDownloadTaskRefreshInterval() > 0) {
            downloadTaskRefreshPromise = $interval(function () {
                if ($scope.task && ($scope.task.status === 'complete' || $scope.task.status === 'error' || $scope.task.status === 'removed')) {
                    $interval.cancel(downloadTaskRefreshPromise);
                    return;
                }

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
}());
