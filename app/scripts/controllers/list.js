(function () {
    'use strict';

    angular.module('ariaNg').controller('DownloadListController', ['$scope', '$window', '$location', '$interval', 'translateFilter',  'aria2RpcService', 'ariaNgSettingService', 'utils', function ($scope, $window, $location, $interval, translateFilter, aria2RpcService, ariaNgSettingService, utils) {
        var location = $location.path().substring(1);
        var downloadTaskRefreshPromise = null;
        var needRequestWholeInfo = true;

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
                'numSeeders',
                'seeder'
            ];

            if (needRequestWholeInfo) {
                requestParams.push('files');
                requestParams.push('bittorrent');
            }

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
                        if (!utils.extendArray(result, $scope.taskContext.list, 'gid')) {
                            if (needRequestWholeInfo) {
                                $scope.taskContext.list = result;
                                needRequestWholeInfo = false;
                            } else {
                                needRequestWholeInfo = true;
                            }
                        } else {
                            needRequestWholeInfo = false;
                        }

                        if ($scope.taskContext.list && $scope.taskContext.list.length > 0) {
                            for (var i = 0; i < $scope.taskContext.list.length; i++) {
                                utils.processDownloadTask($scope.taskContext.list[i]);
                            }
                        }
                    }
                });
            }
        };

        $scope.loadPromise = refreshDownloadTask();

        $scope.filterByTaskName = function (task) {
            if (!task || !angular.isString(task.taskName)) {
                return false;
            }

            if (!$scope.searchContext || !$scope.searchContext.text) {
                return true;
            }

            return (task.taskName.toLowerCase().indexOf($scope.searchContext.text.toLowerCase()) >= 0);
        };

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
