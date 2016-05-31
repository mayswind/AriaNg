(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2StatusController', ['$rootScope', '$scope', 'aria2SettingService', function ($rootScope, $scope, aria2SettingService) {
        $rootScope.loadPromise = (function () {
            return aria2SettingService.getServerStatus(function (result) {
                $scope.serverStatus = result;
            });
        })();
    }]);
})();
