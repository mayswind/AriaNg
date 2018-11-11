(function () {
    'use strict';

    angular.module('ariaNg').controller('MainController', ['$rootScope', '$scope', '$route', '$window', '$location', '$document', '$interval', 'clipboard', 'aria2RpcErrors', 'ariaNgCommonService', 'ariaNgNotificationService', 'ariaNgLocalizationService', 'ariaNgSettingService', 'ariaNgMonitorService', 'ariaNgTitleService', 'aria2TaskService', 'aria2SettingService', function ($rootScope, $scope, $route, $window, $location, $document, $interval, clipboard, aria2RpcErrors, ariaNgCommonService, ariaNgNotificationService, ariaNgLocalizationService, ariaNgSettingService, ariaNgMonitorService, ariaNgTitleService, aria2TaskService, aria2SettingService) {
        var pageTitleRefreshPromise = null;
        var globalStatRefreshPromise = null;

        var refreshPageTitle = function () {
            $document[0].title = ariaNgTitleService.getFinalTitleByGlobalStat($scope.globalStat);
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

        if (ariaNgSettingService.getBrowserNotification()) {
            ariaNgNotificationService.requestBrowserPermission();
        }

        $scope.globalStatusContext = {
            isEnabled: ariaNgSettingService.getGlobalStatRefreshInterval() > 0,
            data: ariaNgMonitorService.getGlobalStatsData()
        };

        $scope.enableDebugMode = function () {
            return ariaNgSettingService.isEnableDebugMode();
        };

        $scope.quickSettingContext = null;

        $scope.rpcSettings = ariaNgSettingService.getAllRpcSettings();

        $scope.isTaskSelected = function () {
            return $rootScope.taskContext.getSelectedTaskIds().length > 0;
        };

        $scope.isSingleUrlTaskSelected = function () {
            var selectedTask = $rootScope.taskContext.getSelectedTasks();

            if (selectedTask.length !== 1) {
                return false;
            }

            return !!selectedTask[0].singleUrl;
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
                    ariaNgLocalizationService.showError('Failed to change some tasks state.');
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
            ariaNgLocalizationService.confirm('Confirm Retry', 'Are you sure you want to retry the selected task? AriaNg will create same task after clicking OK.', 'info', function () {
                $rootScope.loadPromise = aria2TaskService.retryTask(task.gid, function (response) {
                    if (!response.success) {
                        ariaNgLocalizationService.showError('Failed to retry this task.');
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

        $scope.isTaskRetryable = function (task) {
            return task && task.status === 'error' && task.errorDescription && !task.bittorrent;
        };

        $scope.isSelectedTaskRetryable = function () {
            var selectedTasks = $rootScope.taskContext.getSelectedTasks();

            if (selectedTasks.length < 1) {
                return false;
            }

            for (var i = 0; i < selectedTasks.length; i++) {
                if (!$scope.isTaskRetryable(selectedTasks[i])) {
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
                if ($scope.isTaskRetryable(tasks[i])) {
                    retryableTasks.push(tasks[i]);
                } else {
                    skipCount++;
                }
            }

            ariaNgLocalizationService.confirm('Confirm Retry', 'Are you sure you want to retry the selected task? AriaNg will create same task after clicking OK.', 'info', function () {
                $rootScope.loadPromise = aria2TaskService.retryTasks(retryableTasks, function (response) {
                    refreshGlobalStat(true);

                    ariaNgLocalizationService.showInfo('Operation Result', '{{successCount}} tasks have been retried and {{failedCount}} tasks are failed.', function () {
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

            ariaNgLocalizationService.confirm('Confirm Remove', 'Are you sure you want to remove the selected task?', 'warning', function () {
                $rootScope.loadPromise = aria2TaskService.removeTasks(tasks, function (response) {
                    if (response.hasError && tasks.length > 1) {
                        ariaNgLocalizationService.showError('Failed to remove some task(s).');
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
            });
        };

        $scope.clearStoppedTasks = function () {
            ariaNgLocalizationService.confirm('Confirm Clear', 'Are you sure you want to clear stopped tasks?', 'warning', function () {
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

        $scope.copySelectedOneTaskDownloadLink = function () {
            var selectedTask = $rootScope.taskContext.getSelectedTasks();

            if (selectedTask.length === 1) {
                clipboard.copyText(selectedTask[0].singleUrl);
            }
        };

        $scope.changeDisplayOrder = function (type, autoSetReverse) {
            var oldType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getDisplayOrder());
            var newType = ariaNgCommonService.parseOrderType(type);

            if (autoSetReverse && newType.type === oldType.type) {
                newType.reverse = !oldType.reverse;
            }

            ariaNgSettingService.setDisplayOrder(newType.getValue());
        };

        $scope.isSetDisplayOrder = function (type) {
            var orderType = ariaNgCommonService.parseOrderType(ariaNgSettingService.getDisplayOrder());
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
            $window.location.reload();
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
