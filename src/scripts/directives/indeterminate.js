(function () {
    'use strict';

    angular.module('ariaNg').directive('ngIndeterminate', function () {
        return {
            restrict: 'A',
            scope: {
                indeterminate: '=ngIndeterminate'
            },
            link: function (scope, element) {
                scope.$watch('indeterminate', function () {
                    element[0].indeterminate = (scope.indeterminate === 'true' || scope.indeterminate === true);
                });
            }
        };
    });
}());
