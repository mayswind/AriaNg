(function () {
    'use strict';

    angular.module('ariaNg').controller('CommandController', ['$rootScope', '$location', '$routeParams', 'base64', 'ariaNgCommonService', 'aria2TaskService', 'ariaNgLogService', function ($rootScope, $location, $routeParams, base64, ariaNgCommonService, aria2TaskService, ariaNgLogService) {
        var path = $location.path();

        var newUrlDownload = function (url) {
            return aria2TaskService.newUriTask({
                urls: [url],
                options: {}
            }, false, function (response) {
                if (!response.success) {
                    return;
                }

                $location.path('/downloading');
            });
        };

        if (path.indexOf('/new/') === 0) {
            var base64Url = $routeParams.url;
            var url = base64.urldecode(base64Url);
            $rootScope.loadPromise = newUrlDownload(url);
            ariaNgLogService.info("[CommandController] new download: " + url);
        } else {
            ariaNgCommonService.error('Parameter is invalid!');
        }
    }]);
}());
