(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgFileService', ['$q', '$window', function ($q, $window) {
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

        var readFile = function (file, allowedExtensions) {

            var deferred = $q.defer();
            var fileName = file.name;

            if (!checkFileExtension(fileName, allowedExtensions)) {
                deferred.reject('The selected file type is invalid!');
            }

            var reader = new FileReader();

            reader.onload = function() {
                var result = {
                    fileName: fileName,
                    base64Content: this.result.replace(/.*?base64,/, '')
                };
                deferred.resolve(result);
            };

            reader.onerror = function() {
                deferred.reject("Failed to load file!");
            };

            reader.readAsDataURL(file);

            return deferred.promise;
        };

        return {
            openFileContent: function (fileFilter, successCallback, errorCallback, multipleFileMode) {
                if (!isSupportFileReader) {
                    if (errorCallback) {
                        errorCallback('Your browser does not support loading file!');
                    }

                    return;
                }

                var allowedExtensions = getAllowedExtensions(fileFilter);
                var html = '<input type="file" style="display: none"/>';

                if (multipleFileMode){
                    html = '<input type="file" style="display: none" multiple/>';
                }

                angular.element(html).change(function () {

                    if (!this.files || this.files.length < 1) {
                        return;
                    }

                    // read files recursively
                    function addFiles(files, curFile) {

                        var nextFile = curFile + 1;
                        var done = files.length <= nextFile;

                        readFile(files[curFile], allowedExtensions)
                            .then(function(result) {
                                // read file success
                                if (done) {
                                    successCallback(result);
                                } else {
                                    successCallback(result, function() {
                                        addFiles(files, nextFile);
                                    });
                                }
                            })
                            .catch(function(error) {
                                // read file fail
                                errorCallback(error);
                                if (!done) {
                                    addFiles(files, nextFile);
                                }
                            });
                    };

                    addFiles(this.files, 0);

                }).trigger('click');
            }
        };
    }]);
}());
