(function () {
    'use strict';

    angular.module('ariaNg').directive('ngAutoFocus', ['$timeout', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                $timeout(function () {
                    element[0].focus();
                });
            }
        };
    }]);
}());
