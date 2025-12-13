(function () {
    'use strict';

    angular.module('ariaNg').controller('DownloadListController', ['$rootScope', '$scope', '$window', '$location', '$route', '$interval', 'dragulaService', 'aria2RpcErrors', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2TaskService', function ($rootScope, $scope, $window, $location, $route, $interval, dragulaService, aria2RpcErrors, ariaNgCommonService, ariaNgSettingService, aria2TaskService) {
        var location = $location.path().substring(1);
        var downloadTaskRefreshPromise = null;
        var pauseDownloadTaskRefresh = false;
        var needRequestWholeInfo = true;
        var isAllTasksView = location === 'all';

        $scope.isAllTasksView = isAllTasksView;

        // Filter tasks by selected statuses (uses global filters from $rootScope)
        var filterTasksByStatus = function (tasks) {
            if (!isAllTasksView || !tasks) {
                return tasks;
            }

            var filters = $rootScope.allTasksFilters;
            return tasks.filter(function (task) {
                if (task.status === 'active' && filters.active) {
                    return true;
                }
                if (task.status === 'waiting' && filters.waiting) {
                    return true;
                }
                if (task.status === 'paused' && filters.paused) {
                    return true;
                }
                if (task.status === 'complete' && filters.complete) {
                    return true;
                }
                if (task.status === 'error' && filters.error) {
                    return true;
                }
                if (task.status === 'removed' && filters.removed) {
                    return true;
                }
                return false;
            });
        };

        var refreshDownloadTask = function (silent) {
            if (pauseDownloadTaskRefresh) {
                return;
            }

            var taskListMethod;
            
            if (isAllTasksView) {
                taskListMethod = function() {
                    return aria2TaskService.getAllTaskList(needRequestWholeInfo, function (response) {
                        handleTaskListResponse(response, silent);
                    }, silent);
                };
            } else {
                taskListMethod = function() {
                    return aria2TaskService.getTaskList(location, needRequestWholeInfo, function (response) {
                        handleTaskListResponse(response, silent);
                    }, silent);
                };
            }

            return taskListMethod();
        };

        var handleTaskListResponse = function (response, silent) {
            if (pauseDownloadTaskRefresh) {
                return;
            }

            if (!response.success) {
                if (response.data.message === aria2RpcErrors.Unauthorized.message) {
                    $interval.cancel(downloadTaskRefreshPromise);
                }

                return;
            }

            var isRequestWholeInfo = response.context.requestWholeInfo;
            var taskList = response.data;

            if (isRequestWholeInfo) {
                $rootScope.taskContext.list = filterTasksByStatus(taskList);
                needRequestWholeInfo = false;
            } else {
                if ($rootScope.taskContext.list && $rootScope.taskContext.list.length > 0) {
                    for (var i = 0; i < $rootScope.taskContext.list.length; i++) {
                        var task = $rootScope.taskContext.list[i];
                        delete task.verifiedLength;
                        delete task.verifyIntegrityPending;
                    }
                }

                var filteredList = filterTasksByStatus(taskList);
                if (ariaNgCommonService.extendArray(filteredList, $rootScope.taskContext.list, 'gid')) {
                    needRequestWholeInfo = false;
                } else {
                    needRequestWholeInfo = true;
                }
            }

            if ($rootScope.taskContext.list && $rootScope.taskContext.list.length > 0) {
                aria2TaskService.processDownloadTasks($rootScope.taskContext.list);

                if (!isRequestWholeInfo) {
                    var hasFullStruct = false;

                    for (var i = 0; i < $rootScope.taskContext.list.length; i++) {
                        var task = $rootScope.taskContext.list[i];

                        if (task.hasTaskName || task.files || task.bittorrent) {
                            hasFullStruct = true;
                            break;
                        }
                    }

                    if (!hasFullStruct) {
                        needRequestWholeInfo = true;
                        $rootScope.taskContext.list.length = 0;
                        return;
                    }
                }
            }

            $rootScope.taskContext.enableSelectAll = $rootScope.taskContext.list && $rootScope.taskContext.list.length > 0;
        };

        $scope.getOrderType = function () {
            return ariaNgSettingService.getDisplayOrder(location);
        };

        $scope.isSupportDragTask = function () {
            if (!ariaNgSettingService.getDragAndDropTasks()) {
                return false;
            }

            var displayOrder = ariaNgCommonService.parseOrderType(ariaNgSettingService.getDisplayOrder(location));

            return location === 'waiting' && displayOrder.type === 'default';
        };

        // Watch for filter changes to refresh task list (uses global filters)
        $scope.$watch(function() {
            return $rootScope.allTasksFilters;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal && isAllTasksView) {
                needRequestWholeInfo = true;
                refreshDownloadTask(false);
            }
        }, true);

        if (ariaNgSettingService.getDownloadTaskRefreshInterval() > 0) {
            downloadTaskRefreshPromise = $interval(function () {
                refreshDownloadTask(true);
            }, ariaNgSettingService.getDownloadTaskRefreshInterval());
        }

        dragulaService.options($scope, 'task-list', {
            revertOnSpill: true,
            moves: function () {
                return $scope.isSupportDragTask();
            }
        });

        $scope.$on('task-list.drop-model', function (el, target, source) {
            var element = angular.element(target);
            var gid = element.attr('data-gid');
            var index = element.index();

            pauseDownloadTaskRefresh = true;

            aria2TaskService.changeTaskPosition(gid, index, function () {
                pauseDownloadTaskRefresh = false;
            }, true);
        });

        $scope.$on('$destroy', function () {
            pauseDownloadTaskRefresh = true;

            if (downloadTaskRefreshPromise) {
                $interval.cancel(downloadTaskRefreshPromise);
            }
        });

        $rootScope.keydownActions.selectAll = function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            }

            $scope.$apply(function () {
                $scope.selectAllTasks();
            });

            return false;
        };

        $rootScope.keydownActions.delete = function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            }

            $scope.$apply(function () {
                $scope.removeTasks();
            });

            return false;
        }

        $rootScope.loadPromise = refreshDownloadTask(false);
    }]);
}());
