(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgFileService', ['$window', function ($window) {
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
            openFileContent: function (fileFilter, successCallback, errorCallback) {
                if (!isSupportFileReader) {
                    if (errorCallback) {
                        errorCallback('Your browser does not support loading file!');
                    }

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
                        if (errorCallback) {
                            errorCallback('The selected file type is invalid!');
                        }

                        return;
                    }

                    var reader = new FileReader();

                    reader.onload = function () {
                        var result = {
                            fileName: fileName,
                            base64Content: this.result.replace(/.*?base64,/, '')
                        };

                        if (successCallback) {
                            successCallback(result);
                        }
                    };

                    reader.onerror = function () {
                        if (errorCallback) {
                            errorCallback('Failed to load file!');
                        }
                    };

                    reader.readAsDataURL(file);
                }).trigger('click');
            }
        };
    }]);
}());
