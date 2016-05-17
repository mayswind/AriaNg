(function () {
    'use strict';

    angular.module('ariaNg').config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/downloading', {
                templateUrl: 'views/list.html',
                controller: 'DownloadListController'
            })
            .when('/waiting', {
                templateUrl: 'views/list.html',
                controller: 'DownloadListController'
            })
            .when('/stopped', {
                templateUrl: 'views/list.html',
                controller: 'DownloadListController'
            })
            .when('/settings/ariang', {
                templateUrl: 'views/settings-ariang.html',
                controller: 'AriaNgSettingsController'
            })
            .when('/settings/aria2/basic', {
                templateUrl: 'views/settings-aria2.html',
                controller: 'Aria2SettingsController'
            })
            .when('/settings/aria2/bt', {
                templateUrl: 'views/settings-aria2.html',
                controller: 'Aria2SettingsController'
            })
            .when('/settings/aria2/rpc', {
                templateUrl: 'views/settings-aria2.html',
                controller: 'Aria2SettingsController'
            })
            .when('/settings/aria2/advanced', {
                templateUrl: 'views/settings-aria2.html',
                controller: 'Aria2SettingsController'
            })
            .otherwise({
                redirectTo: '/downloading'
            });
    }]);
})();
