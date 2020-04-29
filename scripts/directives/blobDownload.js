(function () {
    'use strict';

    angular.module('ariaNg').directive('ngBlobDownload', ['ariaNgFileService', function (ariaNgFileService) {
        return {
            restrict: 'A',
            scope: {
                ngBlobDownload: '=ngBlobDownload',
                ngFileName: '@',
                ngContentType: '@'
            },
            link: function (scope, element) {
                scope.$watch('ngBlobDownload', function (value) {
                    if (value) {
                        ariaNgFileService.saveFileContent(value, element, {
                            fileName: scope.ngFileName,
                            contentType: scope.ngContentType
                        });
                    }
                });
            }
        };
    }]);
}());
