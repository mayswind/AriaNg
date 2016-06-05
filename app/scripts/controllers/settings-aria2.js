(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2SettingsController', ['$rootScope', '$scope', '$location', 'ariaNgConstants', 'ariaNgCommonService', 'aria2SettingService', function ($rootScope, $scope, $location, ariaNgConstants, ariaNgCommonService, aria2SettingService) {
        var location = $location.path().substring($location.path().lastIndexOf('/') + 1);

        var getAvailableOptions = function (type) {
            var keys = aria2SettingService.getAvailableGlobalOptionsKeys(type);

            if (!keys) {
                ariaNgCommonService.showError('Type is illegal!');
                return;
            }

            return aria2SettingService.getSpecifiedOptions(keys);
        };

        $scope.availableOptions = getAvailableOptions(location);

        $scope.setGlobalOption = function (key, value, optionStatus) {
            return aria2SettingService.setGlobalOption(key, value, function (result) {
                if (result == 'OK') {
                    optionStatus.setSuccess();
                } else {
                    optionStatus.setFailed();
                }
            });
        };

        $rootScope.loadPromise = (function () {
            return aria2SettingService.getGlobalOption(function (result) {
                $scope.globalOptions = result;
            });
        })();
    }]);
})();
