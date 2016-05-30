(function () {
    'use strict';

    angular.module('ariaNg').controller('DownloadListController', ['$rootScope', '$scope', '$window', '$location', '$interval', 'aria2RpcService', 'ariaNgSettingService', 'utils', function ($rootScope, $scope, $window, $location, $interval, aria2RpcService, ariaNgSettingService, utils) {
        var location = $location.path().substring(1);
        var downloadTaskRefreshPromise = null;
        var needRequestWholeInfo = true;

        var refreshDownloadTask = function () {
            var invokeMethod = null;

            if (location == 'downloading') {
                invokeMethod = aria2RpcService.tellActive;
            } else if (location == 'waiting') {
                invokeMethod = aria2RpcService.tellWaiting;
            } else if (location == 'stopped') {
                invokeMethod = aria2RpcService.tellStopped;
            }

            if (invokeMethod) {
                return invokeMethod({
                    requestParams: needRequestWholeInfo ? aria2RpcService.getFullTaskParams() : aria2RpcService.getBasicTaskParams(),
                    callback: function (result) {
                        if (!utils.extendArray(result, $rootScope.taskContext.list, 'gid')) {
                            if (needRequestWholeInfo) {
                                $rootScope.taskContext.list = result;
                                needRequestWholeInfo = false;
                            } else {
                                needRequestWholeInfo = true;
                            }
                        } else {
                            needRequestWholeInfo = false;
                        }

                        if ($rootScope.taskContext.list && $rootScope.taskContext.list.length > 0) {
                            for (var i = 0; i < $rootScope.taskContext.list.length; i++) {
                                utils.processDownloadTask($rootScope.taskContext.list[i]);
                            }
                        }
                    }
                });
            }
        };

        $rootScope.loadPromise = refreshDownloadTask();

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
