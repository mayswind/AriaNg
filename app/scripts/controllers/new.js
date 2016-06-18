(function () {
    'use strict';

    angular.module('ariaNg').controller('NewTaskController', ['$rootScope', '$scope', '$location', 'ariaNgCommonService', 'aria2TaskService', function ($rootScope, $scope, $location, ariaNgCommonService, aria2TaskService) {
        $scope.urls = '';
        $scope.options = {};

        $scope.startDownload = function () {
            var urls = $scope.urls.split('\n');
            var tasks = [];

            for (var i = 0; i < urls.length; i++) {
                tasks.push({
                    urls: [urls[i].trim()],
                    options: $scope.options
                });
            }

            $rootScope.loadPromise = aria2TaskService.newUriTasks(tasks, function (response) {
                if (!response.hasSuccess) {
                    return;
                }

                $location.path('/downloading');
            });
        };
    }]);
})();
