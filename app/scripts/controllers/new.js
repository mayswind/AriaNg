(function () {
    'use strict';

    angular.module('ariaNg').controller('NewTaskController', ['$rootScope', '$scope', '$location', 'aria2SettingService', 'aria2TaskService', function ($rootScope, $scope, $location, aria2SettingService, aria2TaskService) {
        var tabOrders = ['download', 'options'];

        $scope.context = {
            currentTab: 'download',
            urls: '',
            globalOptions: null,
            availableOptions: [],
            options: {}
        };

        $scope.context.availableOptions = (function () {
            var keys = aria2SettingService.getNewTaskOptionKeys();

            return aria2SettingService.getSpecifiedOptions(keys);
        })();

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

        $scope.loadDefaultOption = function () {
            if ($scope.context.globalOptions) {
                return;
            }

            $rootScope.loadPromise = aria2SettingService.getGlobalOption(function (response) {
                if (response.success) {
                    $scope.context.globalOptions = response.data;
                }
            });
        };

        $scope.startDownload = function (pauseOnAdded) {
            var urls = $scope.context.urls.split('\n');
            var options = angular.copy($scope.context.options);
            var tasks = [];

            for (var i = 0; i < urls.length; i++) {
                tasks.push({
                    urls: [urls[i].trim()],
                    options: options
                });
            }

            $rootScope.loadPromise = aria2TaskService.newUriTasks(tasks, pauseOnAdded, function (response) {
                if (!response.hasSuccess) {
                    return;
                }

                if (pauseOnAdded) {
                    $location.path('/waiting');
                } else {
                    $location.path('/downloading');
                }
            });
        };

        $scope.setOption = function (key, value, optionStatus) {
            if (value != '') {
                $scope.context.options[key] = value;
            } else {
                delete $scope.context.options[key];
            }

            optionStatus.setReady();
        };
    }]);
})();
