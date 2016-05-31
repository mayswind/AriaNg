(function () {
    'use strict';

    angular.module('ariaNg').controller('DownloadListController', ['$rootScope', '$scope', '$window', '$location', '$route', '$interval', 'dragulaService', 'ariaNgCommonService', 'ariaNgSettingService', 'ariaNgTaskService', function ($rootScope, $scope, $window, $location, $route, $interval, dragulaService, ariaNgCommonService, ariaNgSettingService, ariaNgTaskService) {
        var location = $location.path().substring(1);
        var downloadTaskRefreshPromise = null;
        var pauseDownloadTaskRefresh = false;
        var needRequestWholeInfo = true;

        var refreshDownloadTask = function () {
            if (pauseDownloadTaskRefresh) {
                return;
            }

            return ariaNgTaskService.getTaskList(location, needRequestWholeInfo, function (result) {
                if (!ariaNgCommonService.extendArray(result, $rootScope.taskContext.list, 'gid')) {
                    if (needRequestWholeInfo) {
                        $rootScope.taskContext.list = result;
                        needRequestWholeInfo = false;
                    } else {
                        needRequestWholeInfo = true;
                    }
                } else {
                    needRequestWholeInfo = false;
                }

                if ($rootScope.taskContext.list) {
                    ariaNgTaskService.processDownloadTasks($rootScope.taskContext.list);
                    $rootScope.taskContext.enableSelectAll = $rootScope.taskContext.list.length > 1;
                }
            });
        };

        $scope.filterByTaskName = function (task) {
            if (!task || !angular.isString(task.taskName)) {
                return false;
            }

            if (!$rootScope.searchContext || !$rootScope.searchContext.text) {
                return true;
            }

            return (task.taskName.toLowerCase().indexOf($rootScope.searchContext.text.toLowerCase()) >= 0);
        };

        $scope.getOrderType = function () {
            return ariaNgSettingService.getDisplayOrder();
        };

        $scope.isSupportDragTask = function () {
            var displayOrder = ariaNgCommonService.parseOrderType(ariaNgSettingService.getDisplayOrder());

            return location == 'waiting' && displayOrder.type == 'default';
        };

        if (ariaNgSettingService.getDownloadTaskRefreshInterval() > 0) {
            downloadTaskRefreshPromise = $interval(function () {
                refreshDownloadTask();
            }, ariaNgSettingService.getDownloadTaskRefreshInterval());
        }

        dragulaService.options($scope, 'task-list', {
            revertOnSpill: true,
            moves: function (el, container, handle) {
                return $scope.isSupportDragTask();
            }
        });

        $scope.$on('task-list.drop-model', function (el, target, source) {
            var element = angular.element(target);
            var gid = element.attr('data-gid');
            var index = element.index();

            pauseDownloadTaskRefresh = true;

            ariaNgTaskService.changeTaskPosition(gid, index, function (result) {
                pauseDownloadTaskRefresh = false;
            });
        });

        $scope.$on('$destroy', function () {
            if (downloadTaskRefreshPromise) {
                $interval.cancel(downloadTaskRefreshPromise);
            }
        });

        $rootScope.loadPromise = refreshDownloadTask();
    }]);
})();
