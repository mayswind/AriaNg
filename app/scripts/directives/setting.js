(function () {
    'use strict';

    angular.module("ariaNg").directive('ngSetting', ['$timeout', 'ariaNgConstants', function ($timeout, ariaNgConstants) {
        return {
            restrict: 'E',
            templateUrl: "views/setting.html",
            require: '?ngModel',
            replace: true,
            scope: {
                option: '=',
                ngModel: '=',
                status: '=',
                beforeChangeValue: '&',
                onChangeValue: '&'
            },
            link: function (scope, element, attrs, ngModel) {
                var pendingSaveRequest = null;
                var options = {
                    lazySaveTimeout: ariaNgConstants.lazySaveTimeout
                };

                angular.extend(options, attrs);

                scope.getTotalCount = function () {
                    if (!scope.optionValue && !angular.isString(scope.optionValue)) {
                        return 0;
                    }

                    return scope.optionValue.split(scope.option.split).length;
                };

                scope.changeValue = function (optionValue, lazySave) {
                    scope.optionValue = optionValue;

                    if (!scope.option || !scope.option.key || scope.option.readonly) {
                        return;
                    }

                    var data = {
                        key: scope.option.key,
                        value: optionValue
                    };

                    if (scope.beforeChangeValue) {
                        scope.beforeChangeValue(data);
                    }

                    if (pendingSaveRequest) {
                        $timeout.cancel(pendingSaveRequest);
                    }

                    if (scope.onChangeValue) {
                        if (lazySave) {
                            pendingSaveRequest = $timeout(function () {
                                scope.onChangeValue(data);
                            }, options.lazySaveTimeout);
                        } else {
                            scope.onChangeValue(data);
                        }
                    }
                };

                scope.$watch(function () {
                    return ngModel.$viewValue;
                }, function (value) {
                    scope.optionValue = value;
                });
            }
        };
    }]);
})();
