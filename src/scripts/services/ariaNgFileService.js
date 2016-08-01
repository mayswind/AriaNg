(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgFileService', ['$window', 'ariaNgCommonService', function ($window, ariaNgCommonService) {
        var isSupportFileReader = !!$window.FileReader;

        var getAllowedExtensions = function (fileFilter) {
            var extensions = [];

            if (!fileFilter || fileFilter.length < 1) {
                extensions.push(/.+$/);
                return extensions;
            }

            var fileFilters = fileFilter.split(',');

            for (var i = 0; i < fileFilters.length; i++) {
                var extension = fileFilters[i];

                if (extension === '*.*') {
                    extensions.push(/.+$/);
                    continue;
                }

                extension = extension.replace('.', '\\.');
                extension = extension + '$';

                extensions.push(new RegExp(extension));
            }

            return extensions;
        };

        var checkFileExtension = function (fileName, extensions) {
            if (!extensions || extensions.length < 1) {
                return true;
            }

            for (var i = 0; i < extensions.length; i++) {
                if (extensions[i].test(fileName)) {
                    return true;
                }
            }

            return false;
        };

        return {
            openFileContent: function (fileFilter, callback) {
                if (!isSupportFileReader) {
                    ariaNgCommonService.showError('Your browser does not support loading file!');
                    return;
                }

                var allowedExtensions = getAllowedExtensions(fileFilter);

                angular.element('<input type="file" style="display: none"/>').change(function () {
                    if (!this.files || this.files.length < 1) {
                        return;
                    }

                    var file = this.files[0];
                    var fileName = file.name;

                    if (!checkFileExtension(fileName, allowedExtensions)) {
                        ariaNgCommonService.showError('The selected file type is invalid!');
                        return;
                    }

                    var reader = new FileReader();

                    reader.onload = function () {
                        var result = {
                            fileName: fileName,
                            base64Content: this.result.replace(/.*?base64,/, '')
                        };

                        if (callback) {
                            callback(result);
                        }
                    };

                    reader.onerror = function () {
                        ariaNgCommonService.showError('Failed to load file!');
                    };

                    reader.readAsDataURL(file);
                }).trigger('click');
            }
        }
    }]);
}());
