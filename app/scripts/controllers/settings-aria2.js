(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2SettingsController', ['$rootScope', '$scope', '$location', '$timeout', 'ariaNgConstants', 'ariaNgCommonService', 'aria2SettingService', function ($rootScope, $scope, $location, $timeout, ariaNgConstants, ariaNgCommonService, aria2SettingService) {
        var location = $location.path().substring($location.path().lastIndexOf('/') + 1);
        var pendingSaveRequests = {};

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

        $scope.setGlobalOption = function (option, value, lazySave) {
            if (!option || !option.key || option.readonly) {
                return;
            }

            var key = option.key;
            var invoke = function () {
                $scope.optionStatus[key] = 'saving';

                return aria2SettingService.setGlobalOption(key, value, function (result) {
                    $scope.optionStatus[key] = 'saved';
                });
            };

            delete $scope.optionStatus[key];

            if (lazySave) {
                if (pendingSaveRequests[key]) {
                    $timeout.cancel(pendingSaveRequests[key]);
                }

                pendingSaveRequests[key] = $timeout(function () {
                    invoke();
                }, ariaNgConstants.lazySaveTimeout);
            } else {
                invoke();
            }
        };

        $rootScope.loadPromise = (function () {
            return aria2SettingService.getGlobalOption(function (result) {
                $scope.globalOptions = result;
            });
        })();
    }]);
})();
