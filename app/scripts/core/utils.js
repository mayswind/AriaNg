(function () {
    'use strict';

    angular.module('ariaNg').factory('utils', ['$location', '$timeout', '$base64', 'SweetAlert', 'translateFilter', 'ariaNgConstants', function ($location, $timeout, $base64, SweetAlert, translateFilter, ariaNgConstants) {
        return {
            generateUniqueId: function () {
                var sourceId = ariaNgConstants.appPrefix + '_' + Math.round(new Date().getTime() / 1000) + '_' + Math.random();
                var hashedId = $base64.encode(sourceId);

                return hashedId;
            },
            alert: function (text) {
                $timeout(function () {
                    SweetAlert.swal({
                        title: translateFilter('Error'),
                        text: translateFilter(text),
                        type: 'error',
                        confirmButtonText: translateFilter('OK')
                    });
                }, 100);
            },
            replaceArray: function (sourceArray, targetArray, keyProperty) {
                if (!targetArray || !sourceArray || sourceArray.length != targetArray.length) {
                    return false;
                }

                for (var i = 0; i < targetArray.length; i++) {
                    if (targetArray[i][keyProperty] == sourceArray[i][keyProperty]) {
                        angular.extend(targetArray[i], sourceArray[i]);
                    } else {
                        return false;
                    }
                }

                return true;
            },
            getFileNameFromPath: function (path) {
                if (!path) {
                    return path;
                }

                var index = path.lastIndexOf('/');

                if (index <= 0 || index == path.length) {
                    return path;
                }

                return path.substring(index + 1);
            },
            isUrlMatchUrl2: function (url, url2) {
                if (url === url2) {
                    return true;
                }

                var index = url2.indexOf(url);

                if (index !== 0) {
                    return false;
                }

                var lastPart = url2.substring(url.length);

                if (lastPart.indexOf('/') == 0) {
                    return true;
                }

                return false;
            },
            parseOrderType: function (value) {
                var values = value.split(':');

                return {
                    type: values[0],
                    reverse: values[1] === 'true',
                    getValue: function () {
                        return this.type + ":" + this.reverse.toString();
                    }
                }
            }
        };
    }]);
})();
