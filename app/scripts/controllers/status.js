(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2StatusController', ['$scope', 'SweetAlert', 'aria2RpcService', 'ariaNgSettingService', function ($scope, SweetAlert, aria2RpcService, ariaNgSettingService) {
        $scope.loadPromise = (function () {
            return aria2RpcService.getVersion({
                callback: function (result) {
                    $scope.serverStatus = result;
                }
            })
        })();
    }]);
})();
