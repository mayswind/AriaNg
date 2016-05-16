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
            .otherwise({
                redirectTo: '/downloading'
            });
    }]);
})();
