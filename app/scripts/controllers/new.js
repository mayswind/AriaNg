(function () {
    'use strict';

    angular.module('ariaNg').controller('NewTaskController', ['$rootScope', '$scope', '$location', '$timeout', 'aria2SettingService', 'aria2TaskService', function ($rootScope, $scope, $location, $timeout, aria2SettingService, aria2TaskService) {
        var tabOrders = ['download', 'options'];

        $scope.context = {
            currentTab: 'download',
            urls: '',
            availableOptions: (function () {
                var keys = aria2SettingService.getNewTaskOptionKeys();

                return aria2SettingService.getSpecifiedOptions(keys);
            })(),
            globalOptions: null,
            options: {}
        };

        $scope.changeTab = function (tabName) {
            if (tabName == 'options') {
                $scope.loadDefaultOption();
            }

            $scope.context.currentTab = tabName;
        };

        $rootScope.swipeActions.extentLeftSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex < tabOrders.length - 1) {
                $scope.changeTab(tabOrders[tabIndex + 1]);
                return true;
            } else {
                return false;
            }
        };

        $rootScope.swipeActions.extentRightSwipe = function () {
            var tabIndex = tabOrders.indexOf($scope.context.currentTab);

            if (tabIndex > 0) {
                $scope.changeTab(tabOrders[tabIndex - 1]);
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
        
        $rootScope.loadPromise = $timeout(function () {
            ;//Do Nothing
        }, 100);
    }]);
})();
