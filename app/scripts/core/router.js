(function () {
    'use strict';

    angular.module('ariaNg').config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/downloading', {
                templateUrl: 'views/list.html',
                controller: 'DownloadListController'
            })
            .when('/scheduling', {
                templateUrl: 'views/list.html',
                controller: 'DownloadListController'
            })
            .when('/stopped', {
                templateUrl: 'views/list.html',
                controller: 'DownloadListController'
            })
            .otherwise({
                redirectTo: '/downloading'
            });
    }]);
})();
