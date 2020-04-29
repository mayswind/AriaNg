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
                    ngTooltipIf: true,
                    ngTooltipPlacement: 'top',
                    ngTooltipContainer: null,
                    ngTooltipTrigger: 'hover'
                };

                angular.extend(options, attrs);

                var showTooltip = options.ngTooltipIf === true || options.ngTooltipIf === 'true';

                var addTooltip = function () {
                    angular.element(element).tooltip({
                        title: scope.title,
                        placement: options.ngTooltipPlacement,
                        container: options.ngTooltipContainer,
                        trigger: options.ngTooltipTrigger,
                        delay: {
                            show: 100,
                            hide: 0
                        }
                    });
                };

                var refreshTooltip = function () {
                    angular.element(element).attr('title', scope.title).tooltip('fixTitle');
                };

                var removeTooltip = function () {
                    angular.element(element).tooltip('destroy');
                };

                if (showTooltip) {
                    addTooltip();
                }

                scope.$watch('title', function () {
                    if (showTooltip) {
                        refreshTooltip();
                    }
                });

                scope.$watch('ngTooltipIf', function (value) {
                    if (angular.isUndefined(value)) {
                        return;
                    }

                    value = (value === true || value === 'true');

                    if (showTooltip === value) {
                        return;
                    }

                    if (value) {
                        addTooltip();
                    } else {
                        removeTooltip();
                    }

                    showTooltip = value;
                });
            }
        };
    });
}());
