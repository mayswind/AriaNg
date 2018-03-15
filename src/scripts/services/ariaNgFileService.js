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

        var readFile = function(file, allowedExtensions, success, fail) {
            var fileName = file.name;

            if (!checkFileExtension(fileName, allowedExtensions)) {
                if (fail) {
                    fail('The selected file type is invalid!');
                }
                return;
            }

            var reader = new FileReader();

            reader.onload = function() {
                var result = {
                    fileName: fileName,
                    base64Content: this.result.replace(/.*?base64,/, '')
                };

                if (success) {
                    success(result);
                }
            };

            reader.onerror = function() {
                if (fail) {
                    fail("Failed to load file!");
                }
            };

            reader.readAsDataURL(file);
        };

        return {
            openFileContent: function (fileFilter, successCallback, errorCallback, multipleFiles) {
                if (!isSupportFileReader) {
                    if (errorCallback) {
                        errorCallback('Your browser does not support loading file!');
                    }

                    return;
                }

                var allowedExtensions = getAllowedExtensions(fileFilter);
                var html = '<input type="file" style="display: none"/>';
                if(multipleFiles){
                    html = '<input type="file" style="display: none" multiple/>';
                }

                angular.element(html).change(function () {
                    if (!this.files || this.files.length < 1) {
                        return;
                    }

                    // Recursively read files
                    function addTasks(files, curTask) {

                        var nextTask = curTask + 1;
                        var done = files.length <= nextTask;

                        // if read file success, send file content to aria2 and read next file.
                        var success = function(result) {
                            if (done) {
                                successCallback(result);
                            } else {
                                successCallback(result, function() {
                                    addTasks(files, nextTask);
                                });
                            }
                        };

                        // if read file fail, skip and read next file.
                        var fail = function(error) {
                            errorCallback(error);
                            if (!done) {
                                addTasks(files, nextTask);
                            }
                        };

                        readFile(files[curTask], allowedExtensions, success, fail);
                    };

                    if (multipleFiles) {
                        addTasks(this.files, 0);
                    } else {
                        readFile(this.files[0], allowedExtensions, successCallback, errorCallback);
                    }

                }).trigger('click');
            }
        };
    }]);
}());
