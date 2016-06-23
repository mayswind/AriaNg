(function () {
    'use strict';

    angular.module('ariaNg').controller('NewTaskController', ['$rootScope', '$scope', '$location', '$timeout', 'aria2SettingService', 'aria2TaskService', 'ariaNgFileService', function ($rootScope, $scope, $location, $timeout, aria2SettingService, aria2TaskService, ariaNgFileService) {
        var tabOrders = ['links', 'options'];

        $scope.context = {
            currentTab: 'links',
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

        $scope.openTorrent = function () {
            ariaNgFileService.openFileContent('.torrent', function (result) {
                var task = {
                    content: result.base64Content,
                    options: angular.copy($scope.context.options)
                };

                $rootScope.loadPromise = aria2TaskService.newTorrentTask(task, true, function (response) {
                    if (!response.success) {
                        return;
                    }

                    $location.path('/task/detail/' + response.data);
                });
            });
        };

        $scope.openMetalink = function () {
            ariaNgFileService.openFileContent('.meta4,.metalink', function (result) {
                var task = {
                    content: result.base64Content,
                    options: angular.copy($scope.context.options)
                };

                $rootScope.loadPromise = aria2TaskService.newMetalinkTask(task, true, function (response) {
                    if (!response.success) {
                        return;
                    }

                    $location.path('/task/detail/' + response.data);
                });
            });
        };

        $scope.startDownload = function (pauseOnAdded) {
            var urls = $scope.context.urls.split('\n');
            var options = angular.copy($scope.context.options);
            var tasks = [];

            for (var i = 0; i < urls.length; i++) {
                if (urls[i] == '' || urls[i].trim() == '') {
                    continue;
                }

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
