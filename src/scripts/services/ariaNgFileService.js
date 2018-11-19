(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgFileService', ['$window', function ($window) {
        var isSupportFileReader = !!$window.FileReader;
        var isSupportBlob = !!$window.Blob;

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
            isSupportFileReader: function () {
                return isSupportFileReader;
            },
            isSupportBlob: function () {
                return isSupportBlob;
            },
            openFileContent: function (options, successCallback, errorCallback, element) {
                if (!isSupportFileReader) {
                    if (errorCallback) {
                        errorCallback('Your browser does not support loading file!');
                    }

                    return;
                }

                options = angular.extend({
                    fileFilter: null,
                    fileType: 'binary' // or 'text'
                }, options);

                var allowedExtensions = getAllowedExtensions(options.fileFilter);

                if (!element || !element.change) {
                    element = angular.element('<input type="file" style="display: none"/>');
                }

                if (options.fileFilter) {
                    element.attr('accept', options.fileFilter);
                }

                element.val('');

                if (element.attr('data-ariang-file-initialized') !== 'true') {
                    element.change(function () {
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
                                fileName: fileName
                            };

                            switch (options.fileType) {
                                case 'text':
                                    result.content = this.result;
                                    break;
                                case 'binary':
                                default:
                                    result.base64Content = this.result.replace(/.*?base64,/, '');
                                    break;
                            }

                            if (successCallback) {
                                successCallback(result);
                            }
                        };

                        reader.onerror = function () {
                            if (errorCallback) {
                                errorCallback('Failed to load file!');
                            }
                        };

                        switch (options.fileType) {
                            case 'text':
                                reader.readAsText(file);
                                break;
                            case 'binary':
                            default:
                                reader.readAsDataURL(file);
                                break;
                        }
                    }).attr('data-ariang-file-initialized', 'true');
                }

                element.trigger('click');
            },
            saveFileContent: function (content, element, options) {
                if (!isSupportBlob) {
                    return;
                }

                options = angular.extend({
                    fileName: null,
                    contentType: 'application/octet-stream',
                    autoTrigger: false,
                    autoRevoke: false
                }, options);

                var blob = new Blob([content], { type: options.contentType });
                var objectUrl = URL.createObjectURL(blob);

                if (!element) {
                    element = angular.element('<a style="display: none"/>');
                }

                element.attr('href', objectUrl);

                if (options.fileName) {
                    element.attr('download', options.fileName);
                }

                if (options.autoTrigger) {
                    element.trigger('click');
                }

                if (options.autoRevoke) {
                    URL.revokeObjectURL(objectUrl);
                }
            }
        };
    }]);
}());
