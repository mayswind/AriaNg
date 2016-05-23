(function () {
    'use strict';

    angular.module('ariaNg').controller('DownloadListController', ['$scope', '$window', '$location', '$interval', 'translateFilter',  'aria2RpcService', 'ariaNgSettingService', 'utils', function ($scope, $window, $location, $interval, translateFilter, aria2RpcService, ariaNgSettingService, utils) {
        var location = $location.path().substring(1);
        var downloadTaskRefreshPromise = null;

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

        var refreshDownloadTask = function () {
            var invokeMethod = null;
            var params = [];
            var requestParams = [
                'gid',
                'totalLength',
                'completedLength',
                'uploadSpeed',
                'downloadSpeed',
                'connections',
                'files',
                'bittorrent',
                'numSeeders',
                'seeder'
            ];

            if (location == 'downloading') {
                invokeMethod = aria2RpcService.tellActive;
                params = [requestParams];
            } else if (location == 'waiting') {
                invokeMethod = aria2RpcService.tellWaiting;
                params = [0, 1000, requestParams];
            } else if (location == 'stopped') {
                invokeMethod = aria2RpcService.tellStopped;
                params = [0, 1000, requestParams];
            }

            if (invokeMethod) {
                return invokeMethod({
                    params: params,
                    callback: function (result) {
                        if (result && result.length > 0) {
                            for (var i = 0; i < result.length; i++) {
                                utils.processDownloadTask(result[i]);
                            }
                        }

                        if (!utils.replaceArray(result, $scope.downloadTasks, 'gid')) {
                            $scope.downloadTasks = result;
                        }
                    }
                });
            }
        };

        $scope.loadPromise = refreshDownloadTask();

        angular.element($window).bind('resize', function () {
            $scope.titleWidth = getTitleWidth();
        });

        $scope.titleWidth = getTitleWidth();

        $scope.getOrderType = function () {
            return ariaNgSettingService.getDisplayOrder();
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
    }]);
})();
