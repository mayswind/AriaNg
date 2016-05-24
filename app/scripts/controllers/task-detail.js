(function () {
    'use strict';

    angular.module('ariaNg').controller('TaskDetailController', ['$scope', '$routeParams', '$interval', 'aria2RpcService', 'ariaNgSettingService', 'utils', function ($scope, $routeParams, $interval, aria2RpcService, ariaNgSettingService, utils) {
        var downloadTaskRefreshPromise = null;

        var refreshPeers = function (task) {
            return aria2RpcService.getPeers({
                params: [task.gid],
                callback: function (result) {
                    if (!utils.extendArray(result, $scope.peers, 'peerId')) {
                        $scope.peers = result;
                    }

                    for (var i = 0; i < $scope.peers.length; i++) {
                        var peer = $scope.peers[i];
                        peer.completePercent = utils.estimateCompletedPercentFromBitField(peer.bitfield) * 100;
                    }
                    
                    $scope.healthPercent = utils.estimateHealthPercentFromPeers(task, $scope.peers);
                }
            })
        };

        var refreshDownloadTask = function () {
            return aria2RpcService.tellStatus({
                params: [$routeParams.gid],
                callback: function (result) {
                    var task = utils.processDownloadTask(result);

                    if (task.status == 'active' && task.bittorrent) {
                        refreshPeers(task);
                    }

                    $scope.task = utils.copyObjectTo(task, $scope.task);
                }
            })
        };

        $scope.context = {
            currentTab: 'overview'
        };

        $scope.healthPercent = 0;
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
