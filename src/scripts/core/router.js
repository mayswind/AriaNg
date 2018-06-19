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
            .when('/new', {
                templateUrl: 'views/new.html',
                controller: 'NewTaskController'
            })
            .when('/new/:url', {
                template: '',
                controller: 'CommandController'
            })
            .when('/task/detail/:gid', {
                templateUrl: 'views/task-detail.html',
                controller: 'TaskDetailController'
            })
            .when('/settings/ariang', {
                templateUrl: 'views/settings-ariang.html',
                controller: 'AriaNgSettingsController'
            })
            .when('/settings/ariang/:extendType', {
                templateUrl: 'views/settings-ariang.html',
                controller: 'AriaNgSettingsController'
            })
            .when('/settings/aria2/basic', {
                templateUrl: 'views/settings-aria2.html',
                controller: 'Aria2SettingsController'
            })
            .when('/settings/aria2/http-ftp-sftp', {
                templateUrl: 'views/settings-aria2.html',
                controller: 'Aria2SettingsController'
            })
            .when('/settings/aria2/http', {
                templateUrl: 'views/settings-aria2.html',
                controller: 'Aria2SettingsController'
            })
            .when('/settings/aria2/ftp-sftp', {
                templateUrl: 'views/settings-aria2.html',
                controller: 'Aria2SettingsController'
            })
            .when('/settings/aria2/bt', {
                templateUrl: 'views/settings-aria2.html',
                controller: 'Aria2SettingsController'
            })
            .when('/settings/aria2/metalink', {
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
            .when('/settings/rpc/set', {
                template: '',
                controller: 'CommandController'
            })
            .when('/settings/rpc/set/:protocol/:host/:port/:interface/:secret?', {
                template: '',
                controller: 'CommandController'
            })
            .when('/debug', {
                templateUrl: 'views/debug.html',
                controller: 'AriaNgDebugController'
            })
            .when('/status', {
                templateUrl: 'views/status.html',
                controller: 'Aria2StatusController'
            })
            .otherwise({
                redirectTo: '/downloading'
            });
    }]);
}());
