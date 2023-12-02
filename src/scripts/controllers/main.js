(function () {
    'use strict';

    angular.module('ariaNg').controller('MainController', ['$rootScope', '$scope', '$route', '$window', '$location', '$document', '$interval', 'clipboard', 'aria2RpcErrors', 'ariaNgCommonService', 'ariaNgVersionService', 'ariaNgNotificationService', 'ariaNgSettingService', 'ariaNgMonitorService', 'ariaNgTitleService', 'aria2TaskService', 'aria2SettingService', function ($rootScope, $scope, $route, $window, $location, $document, $interval, clipboard, aria2RpcErrors, ariaNgCommonService, ariaNgVersionService, ariaNgNotificationService, ariaNgSettingService, ariaNgMonitorService, ariaNgTitleService, aria2TaskService, aria2SettingService) {
        var pageTitleRefreshPromise = null;
        var globalStatRefreshPromise = null;

        var getTaskListPageType = function () {
            var location = $location.path().substring(1);

            if (location === 'downloading' || location === 'waiting' || location === 'stopped') {
                return location;
            } else {
                return '';
            }
        };

        var refreshPageTitle = function () {
            var title = ariaNgTitleService.getFinalTitleByGlobalStat({
                globalStat: $scope.globalStat,
                currentRpcProfile: getCurrentRPCProfile()
            });

            $document[0].title = title;
        };

        var refreshGlobalStat = function (silent, callback) {
            return aria2SettingService.getGlobalStat(function (response) {
                if (!response.success && response.data.message === aria2RpcErrors.Unauthorized.message) {
                    $interval.cancel(globalStatRefreshPromise);
                    return;
                }

                if (response.success) {
                    $scope.globalStat = response.data;
                    ariaNgMonitorService.recordGlobalStat(response.data);
                }

                if (callback) {
                    callback(response);
                }
            }, silent);
        };

        var getCurrentRPCProfile = function () {
            if (!$scope.rpcSettings || $scope.rpcSettings.length < 1) {
                return null;
            }

            for (var i = 0; i < $scope.rpcSettings.length; i++) {
                var rpcSetting = $scope.rpcSettings[i];
                if (rpcSetting.isDefault) {
                    return rpcSetting;
                }
            }

            return null;
        };

        if (ariaNgSettingService.getBrowserNotification()) {
            ariaNgNotificationService.requestBrowserPermission();
        }

        $scope.ariaNgVersion = ariaNgVersionService.getBuildVersion();

        $scope.globalStatusContext = {
            isEnabled: ariaNgSettingService.getGlobalStatRefreshInterval() > 0,
            data: ariaNgMonitorService.getGlobalStatsData()
        };

        $scope.enableDebugMode = function () {
            return ariaNgSettingService.isEnableDebugMode();
        };

        $scope.quickSettingContext = null;

        $scope.rpcSettings = ariaNgSettingService.getAllRpcSettings();
        $scope.currentRpcProfile = getCurrentRPCProfile();
        $scope.isCurrentRpcUseWebSocket = ariaNgSettingService.isCurrentRpcUseWebSocket();

        $scope.isTaskSelected = function () {
            return $rootScope.taskContext.getSelectedTaskIds().length > 0;
        };

        $scope.isSelectedTasksAllHaveUrl = function () {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();

            if (selectedTasks.length < 1) {
                return false;
            }

            for (var i = 0; i < selectedTasks.length; i++) {
                if (!selectedTasks[i].singleUrl) {
                    return false;
                }
            }

            return true;
        };

        $scope.isSelectedTasksAllHaveInfoHash = function () {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();

            if (selectedTasks.length < 1) {
                return false;
            }

            for (var i = 0; i < selectedTasks.length; i++) {
                if (!selectedTasks[i].bittorrent || !selectedTasks[i].infoHash) {
                    return false;
                }
            }

            return true;
        };

        $scope.isSpecifiedTaskSelected = function () {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();

            if (selectedTasks.length < 1) {
                return false;
            }

            for (var i = 0; i < selectedTasks.length; i++) {
                for (var j = 0; j < arguments.length; j++) {
                    if (selectedTasks[i].status === arguments[j]) {
                        return true;
                    }
                }
            }

            return false;
        };

        $scope.isSpecifiedTaskShowing = function () {
            var tasks = $rootScope.taskContext.list;

            if (tasks.length < 1) {
                return false;
            }

            for (var i = 0; i < tasks.length; i++) {
                for (var j = 0; j < arguments.length; j++) {
                    if (tasks[i].status === arguments[j]) {
                        return true;
                    }
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

            if (state === 'start') {
                invoke = aria2TaskService.startTasks;
            } else if (state === 'pause') {
                invoke = aria2TaskService.pauseTasks;
            } else {
                return;
            }

            $rootScope.loadPromise = invoke(gids, function (response) {
                if (response.hasError && gids.length > 1) {
                    ariaNgCommonService.showError('Failed to change some tasks state.');
                }

                if (!response.hasSuccess) {
                    return;
                }

                refreshGlobalStat(true);

                if (!response.hasError && state === 'start') {
                    if ($location.path() === '/waiting') {
                        $location.path('/downloading');
                    } else {
                        $route.reload();
                    }
                } else if (!response.hasError && state === 'pause') {
                    if ($location.path() === '/downloading') {
                        $location.path('/waiting');
                    } else {
                        $route.reload();
                    }
                }
            }, (gids.length > 1));
        };

        $scope.retryTask = function (task) {
            ariaNgCommonService.confirm('Confirm Retry', 'Are you sure you want to retry the selected task? AriaNg will create same task after clicking OK.', 'info', function () {
                $rootScope.loadPromise = aria2TaskService.retryTask(task.gid, function (response) {
                    if (!response.success) {
                        ariaNgCommonService.showError('Failed to retry this task.');
                        return;
                    }

                    refreshGlobalStat(true);

                    var actionAfterRetryingTask = ariaNgSettingService.getAfterRetryingTask();

                    if (response.success && response.data) {
                        if (actionAfterRetryingTask === 'task-list-downloading') {
                            if ($location.path() !== '/downloading') {
                                $location.path('/downloading');
                            } else {
                                $route.reload();
                            }
                        } else if (actionAfterRetryingTask === 'task-detail') {
                            $location.path('/task/detail/' + response.data);
                        } else {
                            $route.reload();
                        }
                    }
                }, false);
            });
        };

        $scope.hasRetryableTask = function () {
            return $rootScope.taskContext.hasRetryableTask();
        };

        $scope.hasCompletedTask = function () {
            return $rootScope.taskContext.hasCompletedTask();
        };

        $scope.isSelectedTaskRetryable = function () {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();

            if (selectedTasks.length < 1) {
                return false;
            }

            for (var i = 0; i < selectedTasks.length; i++) {
                if (!$rootScope.isTaskRetryable(selectedTasks[i])) {
                    return false;
                }
            }

            return true;
        };

        $scope.retryTasks = function () {
            var tasks = $rootScope.taskContext.getSelectedTasks();

            if (!tasks || tasks.length < 1) {
                return;
            } else if (tasks.length === 1) {
                return $scope.retryTask(tasks[0]);
            }

            var retryableTasks = [];
            var skipCount = 0;

            for (var i = 0; i < tasks.length; i++) {
                if ($rootScope.isTaskRetryable(tasks[i])) {
                    retryableTasks.push(tasks[i]);
                } else {
                    skipCount++;
                }
            }

            ariaNgCommonService.confirm('Confirm Retry', 'Are you sure you want to retry the selected task? AriaNg will create same task after clicking OK.', 'info', function () {
                $rootScope.loadPromise = aria2TaskService.retryTasks(retryableTasks, function (response) {
                    refreshGlobalStat(true);

                    ariaNgCommonService.showInfo('Operation Result', '{successCount} tasks have been retried and {failedCount} tasks are failed.', function () {
                        var actionAfterRetryingTask = ariaNgSettingService.getAfterRetryingTask();

                        if (response.hasSuccess) {
                            if (actionAfterRetryingTask === 'task-list-downloading') {
                                if ($location.path() !== '/downloading') {
                                    $location.path('/downloading');
                                } else {
                                    $route.reload();
                                }
                            } else {
                                $route.reload();
                            }
                        }
                    }, {
                        textParams: {
                            successCount: response.successCount,
                            failedCount: response.failedCount,
                            skipCount: skipCount
                        }
                    });
                }, false);
            }, true);
        };

        $scope.removeTasks = function () {
            var tasks = $rootScope.taskContext.getSelectedTasks();

            if (!tasks || tasks.length < 1) {
                return;
            }

            var removeTasks = function () {
                $rootScope.loadPromise = aria2TaskService.removeTasks(tasks, function (response) {
                    if (response.hasError && tasks.length > 1) {
                        ariaNgCommonService.showError('Failed to remove some task(s).');
                    }

                    if (!response.hasSuccess) {
                        return;
                    }

                    refreshGlobalStat(true);

                    if (!response.hasError) {
                        if ($location.path() !== '/stopped') {
                            $location.path('/stopped');
                        } else {
                            $route.reload();
                        }
                    }
                }, (tasks.length > 1));
            };

            if (ariaNgSettingService.getConfirmTaskRemoval()) {
                ariaNgCommonService.confirm('Confirm Remove', 'Are you sure you want to remove the selected task?', 'warning', removeTasks);
            } else {
                removeTasks();
            };
        };

        $scope.clearStoppedTasks = function () {
            ariaNgCommonService.confirm('Confirm Clear', 'Are you sure you want to clear stopped tasks?', 'warning', function () {
                $rootScope.loadPromise = aria2TaskService.clearStoppedTasks(function (response) {
                    if (!response.success) {
                        return;
                    }

                    refreshGlobalStat(true);

                    if ($location.path() !== '/stopped') {
                        $location.path('/stopped');
                    } else {
                        $route.reload();
                    }
                });
            });
        };

        $scope.isAllTasksSelected = function () {
            return $rootScope.taskContext.isAllSelected();
        };

        $scope.selectAllTasks = function () {
            $rootScope.taskContext.selectAll();
        };

        $scope.selectAllFailedTasks = function () {
            $rootScope.taskContext.selectAllFailed();
        };

        $scope.selectAllCompletedTasks = function () {
            $rootScope.taskContext.selectAllCompleted();
        };

        $scope.copySelectedTasksDownloadLink = function () {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();
            var result = '';

            for (var i = 0; i < selectedTasks.length; i++) {
                if (i > 0) {
                    result += '\n';
                }

                result += selectedTasks[i].singleUrl;
            }

            if (result.length > 0) {
                clipboard.copyText(result);
            }
        };

        $scope.copySelectedTasksMagnetLink = function () {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();
            var result = '';

            for (var i = 0; i < selectedTasks.length; i++) {
                if (i > 0) {
                    result += '\n';
                }

                result += 'magnet:?xt=urn:btih:' + selectedTasks[i].infoHash;
            }

            if (result.length > 0) {
                clipboard.copyText(result);
            }
        };

        $scope.changeDisplayOrder = function (type, autoSetReverse) {
            var taskListPageType = getTaskListPageType();
            var oldType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getDisplayOrder(taskListPageType));
            var newType = ariaNgCommonService.parseOrderType(type);

            if (autoSetReverse && newType.type === oldType.type) {
                newType.reverse = !oldType.reverse;
            }

            ariaNgSettingService.setDisplayOrder(newType.getValue(), taskListPageType);
        };

        $scope.isSetDisplayOrder = function (type) {
            var taskListPageType = getTaskListPageType();
            var orderType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getDisplayOrder(taskListPageType));
            var targetType = ariaNgCommonService.parseOrderType(type);

            return orderType.equals(targetType);
        };

        $scope.showQuickSettingDialog = function (type, title) {
            $scope.quickSettingContext = {
                type: type,
                title: title
            };
        };

        $scope.switchRpcSetting = function (setting) {
            if (setting.isDefault) {
                return;
            }

            ariaNgSettingService.setDefaultRpcSetting(setting);

            if ($location.path().indexOf('/task/detail/') === 0) {
                $rootScope.setAutoRefreshAfterPageLoad();
                $location.path('/downloading');
            } else {
                $window.location.reload();
            }
        };

        if (ariaNgSettingService.getTitleRefreshInterval() > 0) {
            pageTitleRefreshPromise = $interval(function () {
                refreshPageTitle();
            }, ariaNgSettingService.getTitleRefreshInterval());
        }

        if (ariaNgSettingService.getGlobalStatRefreshInterval() > 0) {
            globalStatRefreshPromise = $interval(function () {
                refreshGlobalStat(true);
            }, ariaNgSettingService.getGlobalStatRefreshInterval());
        }

        $scope.$on('$destroy', function () {
            if (pageTitleRefreshPromise) {
                $interval.cancel(pageTitleRefreshPromise);
            }

            if (globalStatRefreshPromise) {
                $interval.cancel(globalStatRefreshPromise);
            }
        });

        refreshGlobalStat(true, function () {
            refreshPageTitle();
        });
    }]);
}());
