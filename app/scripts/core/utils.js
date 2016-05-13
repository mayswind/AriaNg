(function () {
    'use strict';

    angular.module('ariaNg').factory('utils', ['$location', '$base64', 'ariaNgConstants', function ($location, $base64, ariaNgConstants) {
        return {
            generateUniqueId: function () {
                var sourceId = ariaNgConstants.appPrefix + '_' + Math.round(new Date().getTime() / 1000) + '_' + Math.random();
                var hashedId = $base64.encode(sourceId);

                return hashedId;
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
            }
        };
    }]);
})();
