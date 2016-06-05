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
                onChangeValue: '&'
            },
            link: function (scope, element, attrs, ngModel) {
                var pendingSaveRequest = null;
                var options = {
                    lazySaveTimeout: ariaNgConstants.lazySaveTimeout
                };

                angular.extend(options, attrs);

                scope.optionStatus = (function () {
                    var value = 'ready';

                    return {
                        getValue: function () {
                            return value;
                        },
                        setReady: function () {
                            value = 'ready';
                        },
                        setPending: function () {
                            value = 'pending';
                        },
                        setSaving: function () {
                            value = 'pending';
                        },
                        setSuccess: function () {
                            value = 'success';
                        },
                        setFailed: function () {
                            value = 'failed';
                        },
                        setError: function () {
                            value = 'error';
                        },
                        getStatusFeedbackStyle: function () {
                            if (value == 'success') {
                                return 'has-success';
                            } else if (value == 'failed') {
                                return 'has-warning';
                            } else if (value == 'error') {
                                return 'has-error';
                            } else {
                                return '';
                            }
                        },
                        getStatusIcon: function () {
                            if (value == 'pending') {
                                return 'fa-hourglass-start';
                            } else if (value == 'saving') {
                                return 'fa-spin fa-pulse fa-spinner';
                            } else if (value == 'success') {
                                return 'fa-check';
                            } else if (value == 'failed') {
                                return 'fa-exclamation';
                            } else if (value == 'error') {
                                return 'fa-times';
                            } else {
                                return '';
                            }
                        },
                        isShowStatusIcon: function () {
                            return this.getStatusIcon() != '';
                        }
                    };
                })();

                scope.getTotalCount = function () {
                    if (!scope.optionValue && !angular.isString(scope.optionValue)) {
                        return 0;
                    }

                    return scope.optionValue.split(scope.option.split).length;
                };

                scope.changeValue = function (optionValue, lazySave) {
                    scope.optionValue = optionValue;
                    scope.optionStatus.setReady();

                    if (!scope.option || !scope.option.key || scope.option.readonly) {
                        return;
                    }

                    var data = {
                        key: scope.option.key,
                        value: optionValue,
                        optionStatus: scope.optionStatus
                    };

                    if (pendingSaveRequest) {
                        $timeout.cancel(pendingSaveRequest);
                    }

                    var invokeChange = function () {
                        scope.optionStatus.setSaving();
                        scope.onChangeValue(data);
                    };

                    if (scope.onChangeValue) {
                        if (lazySave) {
                            scope.optionStatus.setPending();

                            pendingSaveRequest = $timeout(function () {
                                invokeChange();
                            }, options.lazySaveTimeout);
                        } else {
                            invokeChange();
                        }
                    }
                };

                scope.$watch(function () {
                    return ngModel.$viewValue;
                }, function (value) {
                    scope.optionValue = value;
                });

                scope.$watch(function () {
                    return scope.option;
                }, function (value) {
                    angular.element('[data-toggle="popover"]').popover();
                });
            }
        };
    }]);
})();
