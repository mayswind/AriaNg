(function () {
    'use strict';

    angular.module('ariaNg').controller('TaskDetailController', ['$rootScope', '$scope', '$routeParams', '$interval', 'clipboard', 'aria2RpcErrors', 'ariaNgFileTypes', 'ariaNgCommonService', 'ariaNgSettingService', 'ariaNgMonitorService', 'aria2TaskService', 'aria2SettingService', function ($rootScope, $scope, $routeParams, $interval, clipboard, aria2RpcErrors, ariaNgFileTypes, ariaNgCommonService, ariaNgSettingService, ariaNgMonitorService, aria2TaskService, aria2SettingService) {
        var tabOrders = ['overview', 'pieces', 'filelist', 'btpeers'];
        var downloadTaskRefreshPromise = null;
        var pauseDownloadTaskRefresh = false;
        var currentRowTriggeredMenu = null;

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

            if ($scope.task) {
                delete $scope.task.verifiedLength;
                delete $scope.task.verifyIntegrityPending;
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
            var addVirtualFileNode = true;

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
                }, silent, addVirtualFileNode);
            } else {
                return aria2TaskService.getTaskStatusAndBtPeers($routeParams.gid, function (response) {
                    if (!response.success) {
                        return processError(response.data.message);
                    }

                    processTask(response.task);
                    processPeers(response.peers);
                }, silent, requireBtPeers($scope.task), includeLocalPeer, addVirtualFileNode);
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

                if (file && file.selected && !file.isDir) {
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

        var setSelectedNode = function (node, value) {
            if (!node) {
                return;
            }

            if (node.files && node.files.length) {
                for (var i = 0; i < node.files.length; i++) {
                    var fileNode = node.files[i];
                    fileNode.selected = value;
                }
            }

            if (node.subDirs && node.subDirs.length) {
                for (var i = 0; i < node.subDirs.length; i++) {
                    var dirNode = node.subDirs[i];
                    setSelectedNode(dirNode, value);
                }
            }

            node.selected = value;
            node.partialSelected = false;
        };

        var updateDirNodeSelectedStatus = function (node) {
            if (!node) {
                return;
            }

            var selectedSubNodesCount = 0;
            var partitalSelectedSubNodesCount = 0;

            if (node.files && node.files.length) {
                for (var i = 0; i < node.files.length; i++) {
                    var fileNode = node.files[i];
                    selectedSubNodesCount += (fileNode.selected ? 1 : 0);
                }
            }

            if (node.subDirs && node.subDirs.length) {
                for (var i = 0; i < node.subDirs.length; i++) {
                    var dirNode = node.subDirs[i];
                    updateDirNodeSelectedStatus(dirNode);
                    selectedSubNodesCount += (dirNode.selected ? 1 : 0);
                    partitalSelectedSubNodesCount += (dirNode.partialSelected ? 1 : 0);
                }
            }

            node.selected = (selectedSubNodesCount > 0 && selectedSubNodesCount === (node.subDirs.length + node.files.length));
            node.partialSelected = ((selectedSubNodesCount > 0 && selectedSubNodesCount < (node.subDirs.length + node.files.length)) || partitalSelectedSubNodesCount > 0);
        };

        var updateAllDirNodesSelectedStatus = function () {
            if (!$scope.task || !$scope.task.multiDir) {
                return;
            }

            for (var i = 0; i < $scope.task.files.length; i++) {
                var node = $scope.task.files[i];

                if (!node.isDir) {
                    continue;
                }

                updateDirNodeSelectedStatus(node);
            }
        };

        $scope.context = {
            currentTab: 'overview',
            isEnableSpeedChart: ariaNgSettingService.getDownloadTaskRefreshInterval() > 0,
            showChooseFilesToolbar: false,
            fileExtensions: [],
            collapsedDirs: {},
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

        $rootScope.swipeActions.extendLeftSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex < tabOrders.length - 1) {
                $scope.changeTab(tabOrders[tabIndex + 1]);
                return true;
            } else {
                return false;
            }
        };

        $rootScope.swipeActions.extendRightSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex > 0) {
                $scope.changeTab(tabOrders[tabIndex - 1]);
                return true;
            } else {
                return false;
            }
        };

        $scope.changeFileListDisplayOrder = function (type, autoSetReverse) {
            if ($scope.task && $scope.task.multiDir) {
                return;
            }

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
            if ($scope.task && $scope.task.multiDir) {
                return null;
            }

            return ariaNgSettingService.getFileListDisplayOrder();
        };

        $scope.showChooseFilesToolbar = function () {
            if (!$scope.context.showChooseFilesToolbar) {
                pauseDownloadTaskRefresh = true;
                $scope.context.showChooseFilesToolbar = true;
            } else {
                $scope.cancelChooseFiles();
            }
        };

        $scope.isAnyFileSelected = function () {
            if (!$scope.task || !$scope.task.files) {
                return false;
            }

            for (var i = 0; i < $scope.task.files.length; i++) {
                var file = $scope.task.files[i];

                if (!file.isDir && file.selected) {
                    return true;
                }
            }

            return false;
        };

        $scope.isAllFileSelected = function () {
            if (!$scope.task || !$scope.task.files) {
                return false;
            }

            for (var i = 0; i < $scope.task.files.length; i++) {
                var file = $scope.task.files[i];

                if (!file.isDir && !file.selected) {
                    return false;
                }
            }

            return true;
        };

        $scope.selectFiles = function (type) {
            if (!$scope.task || !$scope.task.files) {
                return;
            }

            if (type === 'auto') {
                if ($scope.isAllFileSelected()) {
                    type = 'none';
                } else {
                    type = 'all';
                }
            }

            for (var i = 0; i < $scope.task.files.length; i++) {
                var file = $scope.task.files[i];

                if (file.isDir) {
                    continue;
                }

                if (type === 'all') {
                    file.selected = true;
                } else if (type === 'none') {
                    file.selected = false;
                } else if (type === 'reverse') {
                    file.selected = !file.selected;
                }
            }

            updateAllDirNodesSelectedStatus();
        };

        $scope.chooseSpecifiedFiles = function (type) {
            if (!$scope.task || !$scope.task.files || !ariaNgFileTypes[type]) {
                return;
            }

            var files = $scope.task.files;
            var extensions = ariaNgFileTypes[type].extensions;
            var fileIndexes = [];
            var isAllSelected = true;

            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (file.isDir) {
                    continue;
                }

                var extension = ariaNgCommonService.getFileExtension(file.fileName);

                if (extension) {
                    extension = extension.toLowerCase();
                }

                if (extensions.indexOf(extension) >= 0) {
                    fileIndexes.push(i);

                    if (!file.selected) {
                        isAllSelected = false;
                    }
                }
            }

            for (var i = 0; i < fileIndexes.length; i++) {
                var index = fileIndexes[i];
                var file = files[index];

                if (file && !file.isDir) {
                    file.selected = !isAllSelected;
                }
            }

            updateAllDirNodesSelectedStatus();
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

        $scope.showCustomChooseFileModal = function () {
            if (!$scope.task || !$scope.task.files) {
                return;
            }

            var files = $scope.task.files;
            var extensionsMap = {};

            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (file.isDir) {
                    continue;
                }

                var extension = ariaNgCommonService.getFileExtension(file.fileName);

                if (extension) {
                    extension = extension.toLowerCase();
                }

                var extensionInfo = extensionsMap[extension];

                if (!extensionInfo) {
                    var extensionName = extension;

                    if (extensionName.length > 0 && extensionName.charAt(0) === '.') {
                        extensionName = extensionName.substring(1);
                    }

                    extensionInfo = {
                        extension: extensionName,
                        classified: false,
                        selected: false,
                        selectedCount: 0,
                        unSelectedCount: 0
                    };

                    extensionsMap[extension] = extensionInfo;
                }

                if (file.selected) {
                    extensionInfo.selected = true;
                    extensionInfo.selectedCount++;
                } else {
                    extensionInfo.unSelectedCount++;
                }
            }

            var allClassifiedExtensions = {};

            for (var type in ariaNgFileTypes) {
                if (!ariaNgFileTypes.hasOwnProperty(type)) {
                    continue;
                }

                var extensionTypeName = ariaNgFileTypes[type].name;
                var allExtensions = ariaNgFileTypes[type].extensions;
                var extensions = [];

                for (var i = 0; i < allExtensions.length; i++) {
                    var extension = allExtensions[i];
                    var extensionInfo = extensionsMap[extension];

                    if (extensionInfo) {
                        extensionInfo.classified = true;
                        extensions.push(extensionInfo);
                    }
                }

                if (extensions.length > 0) {
                    allClassifiedExtensions[type] = {
                        name: extensionTypeName,
                        extensions: extensions
                    };
                }
            }

            var unClassifiedExtensions = [];

            for (var extension in extensionsMap) {
                if (!extensionsMap.hasOwnProperty(extension)) {
                    continue;
                }

                var extensionInfo = extensionsMap[extension];

                if (!extensionInfo.classified) {
                    unClassifiedExtensions.push(extensionInfo);
                }
            }

            if (unClassifiedExtensions.length > 0) {
                allClassifiedExtensions.other = {
                    name: 'Other',
                    extensions: unClassifiedExtensions
                };
            }

            $scope.context.fileExtensions = allClassifiedExtensions;
            angular.element('#custom-choose-file-modal').modal();
        };

        $scope.setSelectedExtension = function (selectedExtension, selected) {
            if (!$scope.task || !$scope.task.files) {
                return;
            }

            var files = $scope.task.files;

            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (file.isDir) {
                    continue;
                }

                var extension = ariaNgCommonService.getFileExtension(file.fileName);

                if (extension) {
                    extension = extension.toLowerCase();
                }

                if (extension !== '.' + selectedExtension) {
                    continue;
                }

                file.selected = selected;
            }

            updateAllDirNodesSelectedStatus();
        };

        $('#custom-choose-file-modal').on('hide.bs.modal', function (e) {
            $scope.context.fileExtensions = null;
        });

        $scope.setSelectedFile = function (updateNodeSelectedStatus) {
            if (updateNodeSelectedStatus) {
                updateAllDirNodesSelectedStatus();
            }

            if (!$scope.context.showChooseFilesToolbar) {
                setSelectFiles(true);
            }
        };

        $scope.collapseDir = function (dirNode, newValue, forceRecurse) {
            var nodePath = dirNode.nodePath;

            if (angular.isUndefined(newValue)) {
                newValue = !$scope.context.collapsedDirs[nodePath];
            }

            if (newValue || forceRecurse) {
                for (var i = 0; i < dirNode.subDirs.length; i++) {
                    $scope.collapseDir(dirNode.subDirs[i], newValue);
                }
            }

            if (nodePath) {
                $scope.context.collapsedDirs[nodePath] = newValue;
            }
        };

        $scope.collapseAllDirs = function (newValue) {
            if (!$scope.task || !$scope.task.files) {
                return;
            }

            for (var i = 0; i < $scope.task.files.length; i++) {
                var node = $scope.task.files[i];

                if (!node.isDir) {
                    continue;
                }

                $scope.collapseDir(node, newValue, true);
            }
        };

        $scope.setSelectedNode = function (dirNode) {
            setSelectedNode(dirNode, dirNode.selected);
            updateAllDirNodesSelectedStatus();

            if (!$scope.context.showChooseFilesToolbar) {
                $scope.setSelectedFile(false);
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

        $scope.copySelectedRowText = function () {
            if (!currentRowTriggeredMenu) {
                return;
            }

            var name = currentRowTriggeredMenu.find('.setting-key > span').text().trim();
            var value = "";

            currentRowTriggeredMenu.find('.setting-value > span').each(function (i, element) {
                if (i > 0) {
                    value += '\n';
                }

                value += angular.element(element).text().trim();
            });

            if (ariaNgSettingService.getIncludePrefixWhenCopyingFromTaskDetails()) {
                var info = name + ': ' + value;
                clipboard.copyText(info);
            } else {
                clipboard.copyText(value);
            };
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

        $scope.onOverviewMouseDown = function () {
            angular.element('#overview-items .row[contextmenu-bind!="true"]').contextmenu({
                target: '#task-overview-contextmenu',
                before: function (e, context) {
                    currentRowTriggeredMenu = context;
                }
            }).attr('contextmenu-bind', 'true');
        };

        angular.element('#task-overview-contextmenu').on('hide.bs.context', function () {
            currentRowTriggeredMenu = null;
        });

        $rootScope.loadPromise = refreshDownloadTask(false);
    }]);
}());
