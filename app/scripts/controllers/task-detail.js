(function () {
    'use strict';

    angular.module('ariaNg').controller('TaskDetailController', ['$scope', '$routeParams', '$interval', 'aria2RpcService', 'ariaNgSettingService', 'utils', function ($scope, $routeParams, $interval, aria2RpcService, ariaNgSettingService, utils) {
        var downloadTaskRefreshPromise = null;

        var refreshPeers = function () {
            return aria2RpcService.getPeers({
                params: [$routeParams.gid],
                callback: function (result) {
                    if (!utils.extendArray(result, $scope.peers, 'peerId')) {
                        $scope.peers = result;
                    }
                }
            })
        };

        var refreshDownloadTask = function () {
            return aria2RpcService.tellStatus({
                params: [$routeParams.gid],
                callback: function (result) {
                    var task = utils.processDownloadTask(result);

                    if (task.status == 'active' && task.bittorrent) {
                        refreshPeers();
                    }

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
