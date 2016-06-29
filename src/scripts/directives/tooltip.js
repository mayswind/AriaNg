(function () {
    'use strict';

    angular.module('ariaNg').directive('ngTooltip', function () {
        return {
            restrict: 'A',
            scope: {
                title: '@ngTooltip'
            },
            link: function (scope, element, attrs) {
                var options = {
                    ngTooltipPlacement: 'top',
                    ngTooltipContainer: null,
                    ngTooltipTrigger: 'hover'
                };

                angular.extend(options, attrs);

                angular.element(element).tooltip({
                    title: scope.title,
                    placement: options.ngTooltipPlacement,
                    container: options.ngTooltipContainer,
                    trigger: options.ngTooltipTrigger
                });

                scope.$watch('title', function () {
                    angular.element(element).attr('title', scope.title).tooltip('fixTitle');
                });
            }
        };
    });
})();
