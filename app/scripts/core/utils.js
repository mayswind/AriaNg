(function () {
    'use strict';

    angular.module('ariaNg').factory('utils', ['$location', '$timeout', '$base64', 'SweetAlert', 'translateFilter', 'ariaNgConstants', function ($location, $timeout, $base64, SweetAlert, translateFilter, ariaNgConstants) {
        var calculateDownloadRemainTime = function (remainBytes, downloadSpeed) {
            if (downloadSpeed == 0) {
                return 0;
            }

            return remainBytes / downloadSpeed;
        };

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
            extendArray: function (sourceArray, targetArray, keyProperty) {
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
            processDownloadTask: function (task) {
                if (!task) {
                    return task;
                }

                task.totalLength = parseInt(task.totalLength);
                task.completedLength = parseInt(task.completedLength);
                task.uploadSpeed = parseInt(task.uploadSpeed);
                task.downloadSpeed = parseInt(task.downloadSpeed);
                task.completePercent = (task.totalLength > 0 ? task.completedLength / task.totalLength * 100 : 0);
                task.idle = task.downloadSpeed == 0;

                var remainLength = task.totalLength - task.completedLength;
                task.remainTime = calculateDownloadRemainTime(remainLength, task.downloadSpeed);

                if (task.bittorrent && task.bittorrent.info) {
                    task.taskName = task.bittorrent.info.name;
                } else if (task.files && task.files.length >= 1) {
                    task.taskName = this.getFileNameFromPath(task.files[0].path);
                } else {
                    task.taskName = translateFilter('Unknown');
                }

                if (task.files) {
                    for (var i = 0; i < task.files.length; i++) {
                        var file = task.files[i];
                        file.length = parseInt(file.length);
                        file.completedLength = parseInt(file.completedLength);
                        file.completePercent = (file.length > 0 ? file.completedLength / file.length * 100 : 0);
                    }
                }

                return task;
            },
            copyObjectTo: function (from, to) {
                if (!to) {
                    return from;
                }

                for (var name in from) {
                    if (!from.hasOwnProperty(name)) {
                        continue;
                    }

                    var fromValue = from[name];
                    var toValue = to[name];

                    if (angular.isObject(fromValue) || angular.isArray(fromValue)) {
                        to[name] = this.copyObjectTo(from[name], to[name]);
                    } else {
                        if (fromValue != toValue) {
                            to[name] = fromValue;
                        }
                    }
                }

                return to;
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
