(function () {
    'use strict';

    angular.module('ariaNg').controller('TaskDetailController', ['$rootScope', '$scope', '$routeParams', '$interval', 'aria2RpcService', 'ariaNgSettingService', 'utils', function ($rootScope, $scope, $routeParams, $interval, aria2RpcService, ariaNgSettingService, utils) {
        var tabOrders = ['overview', 'blocks', 'filelist', 'btpeers'];
        var downloadTaskRefreshPromise = null;

        $scope.context = {
            currentTab: 'overview'
        };

        $scope.healthPercent = 0;

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
                    } else {
                        if (tabOrders.indexOf('btpeers') >= 0) {
                            tabOrders.splice(tabOrders.indexOf('btpeers'), 1);
                        }
                    }

                    $scope.task = utils.copyObjectTo(task, $scope.task);
                }
            })
        };

        $rootScope.swipeActions.extentLeftSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex < tabOrders.length - 1) {
                $scope.context.currentTab = tabOrders[tabIndex + 1];
                return true;
            } else {
                return false;
            }
        };

        $rootScope.swipeActions.extentRightSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex > 0) {
                $scope.context.currentTab = tabOrders[tabIndex - 1];
                return true;
            } else {
                return false;
            }
        };

        $scope.changeFileListDisplayOrder = function (type, autoSetReverse) {
            var oldType = utils.parseOrderType(ariaNgSettingService.getFileListDisplayOrder());
            var newType = utils.parseOrderType(type);

            if (autoSetReverse && newType.type == oldType.type) {
                newType.reverse = !oldType.reverse;
            }

            ariaNgSettingService.setFileListDisplayOrder(newType.getValue());
        };

        $scope.isSetFileListDisplayOrder = function (type) {
            var orderType = utils.parseOrderType(ariaNgSettingService.getFileListDisplayOrder());
            var targetType = utils.parseOrderType(type);

            return orderType.equals(targetType);
        };

        $scope.getFileListOrderType = function () {
            return ariaNgSettingService.getFileListDisplayOrder();
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
