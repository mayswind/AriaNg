(function () {
    'use strict';

    angular.module("ariaNg").filter('filename', ['utils', function (utils) {
        return function (path) {
            return utils.getFileNameFromPath(path);
        }
    }]);
})();
