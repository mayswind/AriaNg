(function () {
    'use strict';

    angular.module('ariaNg').directive('ngValidUrls', ['ariaNgCommonService', function (ariaNgCommonService) {
        var DIRECTIVE_ID = 'invalidUrls';

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                var handleChange = function (value) {
                    if (angular.isUndefined(value) || value === '') {
                        return;
                    }

                    var urls = ariaNgCommonService.parseUrlsFromOriginInput(value);
                    var valid = urls && urls.length > 0;

                    ngModel.$setValidity(DIRECTIVE_ID, valid);
                };

                scope.$watch(function () {
                    return ngModel.$viewValue;
                }, handleChange);
            }
        };
    }]);
}());
