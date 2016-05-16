(function () {
    'use strict';

    angular.module('ariaNg').controller('DownloadListController', ['$scope', '$window', '$location', '$interval', 'translateFilter',  'aria2RpcService', 'ariaNgSettingService', 'utils', function ($scope, $window, $location, $interval, translateFilter, aria2RpcService, ariaNgSettingService, utils) {
        var location = $location.path().substring(1);

        var getTitleWidth = function () {
            var titleColumn = angular.element('.task-table > .row > .col-md-8:first-child');

            if (titleColumn.length > 0) {
                return titleColumn.width();
            } else {
                var taskTable = angular.element('.task-table');

                if ($window.innerWidth <= 767) {
                    return taskTable.width();
                } else {
                    return taskTable.width() / 12 * 8;
                }
            }
        };

        var calculateDownloadRemainTime = function (remainBytes, downloadSpeed) {
            if (downloadSpeed == 0) {
                return 0;
            }

            return remainBytes / downloadSpeed;
        };

        var processDownloadTask = function (task) {
            var totalLength = parseInt(task.totalLength);
            var completedLength = parseInt(task.completedLength);
            var remainLength = totalLength - completedLength;

            if (task.bittorrent && task.bittorrent.info) {
                task.taskName = task.bittorrent.info.name;
            } else if (task.files && task.files.length >= 1) {
                task.taskName = utils.getFileNameFromPath(task.files[0].path);
            } else {
                task.taskName = translateFilter('Unknown');
            }

            task.fileSize = totalLength;
            task.completePercent = completedLength / totalLength * 100;
            task.idle = task.downloadSpeed == 0;
            task.remainTime = calculateDownloadRemainTime(remainLength, task.downloadSpeed);
        };

        $scope.titleWidth = getTitleWidth();

        angular.element($window).bind('resize', function () {
            $scope.titleWidth = getTitleWidth();
        });

        $scope.getOrderType = function () {
            return ariaNgSettingService.getDisplayOrder();
        };

        var downloadTaskRefreshPromise = $interval(function () {
            var invokeMethod = null;
            var params = [];

            if (location == 'downloading') {
                invokeMethod = aria2RpcService.tellActive;
            } else if (location == 'waiting') {
                invokeMethod = aria2RpcService.tellWaiting;
                params = [0, 1000];
            } else if (location == 'stopped') {
                invokeMethod = aria2RpcService.tellStopped;
                params = [0, 1000];
            }

            if (invokeMethod) {
                invokeMethod({
                    params: params,
                    callback: function (result) {
                        if (result && result.length > 0) {
                            for (var i = 0; i < result.length; i++) {
                                processDownloadTask(result[i]);
                            }
                        }

                        if (!utils.replaceArray(result, $scope.downloadTasks, 'gid')) {
                            $scope.downloadTasks = result;
                        }
                    }
                });
            }
        }, ariaNgSettingService.getDownloadTaskRefreshInterval());

        $scope.$on('$destroy', function () {
            if (downloadTaskRefreshPromise) {
                $interval.cancel(downloadTaskRefreshPromise);
            }
        });
    }]);
})();
