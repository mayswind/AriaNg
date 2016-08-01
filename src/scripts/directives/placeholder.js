(function () {
    'use strict';

    angular.module('ariaNg').directive('ngPlaceholder', function () {
        return {
            restrict: 'A',
            scope: {
                placeholder: '=ngPlaceholder'
            },
            link: function (scope, element) {
                scope.$watch('placeholder', function () {
                    element[0].placeholder = scope.placeholder;
                });
            }
        };
    });
}());
