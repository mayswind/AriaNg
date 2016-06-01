(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2SettingsController', ['$rootScope', '$scope', '$location', 'ariaNgConstants', 'ariaNgCommonService', 'aria2SettingService', function ($rootScope, $scope, $location, ariaNgConstants, ariaNgCommonService, aria2SettingService) {
        var location = $location.path().substring($location.path().lastIndexOf('/') + 1);

        var getAvailableOptions = function (type) {
            var keys = aria2SettingService.getAvailableOptionsKeys(type);

            if (!keys) {
                ariaNgCommonService.alert('Type is illegal!');
                return;
            }

            return aria2SettingService.getSpecifiedOptions(keys);
        };

        $scope.optionStatus = {};
        $scope.availableOptions = getAvailableOptions(location);

        $scope.pendingGlobalOption = function (key, value) {
            $scope.optionStatus[key] = 'pending';
        };

        $scope.setGlobalOption = function (key, value) {
            $scope.optionStatus[key] = 'saving';

            return aria2SettingService.setGlobalOption(key, value, function (result) {
                $scope.optionStatus[key] = 'saved';
            });
        };

        $rootScope.loadPromise = (function () {
            return aria2SettingService.getGlobalOption(function (result) {
                $scope.globalOptions = result;
            });
        })();
    }]);
})();
