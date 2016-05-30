(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2StatusController', ['$rootScope', '$scope', 'aria2RpcService', function ($rootScope, $scope, aria2RpcService) {
        $rootScope.loadPromise = (function () {
            return aria2RpcService.getVersion({
                callback: function (result) {
                    $scope.serverStatus = result;
                }
            })
        })();
    }]);
})();
