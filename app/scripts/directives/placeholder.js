(function () {
    'use strict';

    angular.module("ariaNg").directive('ngPlaceholder', function () {
        return {
            restrict: 'A',
            scope: {
                placeholder: '=ngPlaceholder'
            },
            link: function (scope, elem) {
                scope.$watch('placeholder', function () {
                    elem[0].placeholder = scope.placeholder;
                });
            }
        };
    });
})();
