(function () {
    'use strict';

    angular.module('ariaNg').controller('TaskDetailController', ['$scope', '$routeParams', '$interval', 'aria2RpcService', 'ariaNgSettingService', 'utils', function ($scope, $routeParams, $interval, aria2RpcService, ariaNgSettingService, utils) {
        var downloadTaskRefreshPromise = null;

        var refreshDownloadTask = function () {
            return aria2RpcService.tellStatus({
                params: [$routeParams.gid],
                callback: function (result) {
                    var task = utils.processDownloadTask(result);
                    $scope.task = utils.copyObjectTo(task, $scope.task);
                }
            })
        };

        $scope.context = {
            currentTab: 'overview'
        };

        $scope.loadPromise = refreshDownloadTask();

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
