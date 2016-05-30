(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2SettingsController', ['$rootScope', '$scope', '$location', '$timeout', 'ariaNgConstants', 'aria2GlobalAvailableOptions', 'aria2RpcService', 'utils', function ($rootScope, $scope, $location, $timeout, ariaNgConstants, aria2GlobalAvailableOptions, aria2RpcService, utils) {
        var location = $location.path().substring($location.path().lastIndexOf('/') + 1);
        var pendingSaveRequest = {};

        var getAvailableOptionsKeys = function (location) {
            if (location == 'basic') {
                return aria2GlobalAvailableOptions.basicOptions;
            } else if (location == 'http-ftp-sftp') {
                return aria2GlobalAvailableOptions.httpFtpSFtpOptions;
            } else if (location == 'http') {
                return aria2GlobalAvailableOptions.httpOptions;
            } else if (location == 'ftp-sftp') {
                return aria2GlobalAvailableOptions.ftpSFtpOptions;
            } else if (location == 'bt') {
                return aria2GlobalAvailableOptions.btOptions;
            } else if (location == 'metalink') {
                return aria2GlobalAvailableOptions.metalinkOptions;
            } else if (location == 'rpc') {
                return aria2GlobalAvailableOptions.rpcOptions;
            } else if (location == 'advanced') {
                return aria2GlobalAvailableOptions.advancedOptions;
            } else {
                utils.alert('Type is illegal!');
                return false;
            }
        };

        var getAvailableOptions = function (location) {
            var keys = getAvailableOptionsKeys(location);

            if (!keys) {
                return;
            }

            return utils.getOptions(keys);
        };

        $scope.optionStatus = {};
        $scope.availableOptions = getAvailableOptions(location);
        $scope.setGlobalOption = function (option, value, lazySave) {
            if (!option || !option.key || option.readonly) {
                return;
            }

            var key = option.key;
            var invoke = function () {
                var data = {};
                data[key] = value;

                $scope.optionStatus[key] = 'saving';

                return aria2RpcService.changeGlobalOption({
                    options: data,
                    callback: function () {
                        $scope.optionStatus[key] = 'saved';
                    }
                });
            };

            delete $scope.optionStatus[key];

            if (lazySave) {
                if (pendingSaveRequest[key]) {
                    $timeout.cancel(pendingSaveRequest[key]);
                }

                pendingSaveRequest[key] = $timeout(function () {
                    invoke();
                }, ariaNgConstants.lazySaveTimeout);
            } else {
                invoke();
            }
        };

        $rootScope.loadPromise = (function () {
            return aria2RpcService.getGlobalOption({
                callback: function (result) {
                    $scope.globalOptions = result;
                }
            });
        })();
    }]);
})();
