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
            getTaskName: function (task) {
                var taskName = "";

                if (task.bittorrent && task.bittorrent.info) {
                    taskName = task.bittorrent.info.name;
                }

                if (!taskName && task.files && task.files.length >= 1) {
                    taskName = this.getFileNameFromPath(task.files[0].path);
                }

                if (!taskName && task.files && task.files.length >= 1 && task.files[0].uris && task.files[0].uris.length >= 1) {
                    taskName = this.getFileNameFromPath(task.files[0].uris[0].uri);
                }

                if (!taskName) {
                    taskName = translateFilter('Unknown');
                }

                return taskName;
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
                task.taskName = this.getTaskName(task);
                task.idle = task.downloadSpeed == 0;

                var remainLength = task.totalLength - task.completedLength;
                task.remainTime = calculateDownloadRemainTime(remainLength, task.downloadSpeed);

                if (task.files) {
                    for (var i = 0; i < task.files.length; i++) {
                        var file = task.files[i];
                        file.fileName = this.getFileNameFromPath(file.path);
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

                var obj = {
                    type: values[0],
                    order: values[1],
                    equals: function (obj) {
                        if (angular.isUndefined(obj.order)) {
                            return this.type === obj.type;
                        } else {
                            return this.type === obj.type && this.order === obj.order;
                        }
                    },
                    getValue: function () {
                        return this.type + ":" + this.order;
                    }
                };

                Object.defineProperty(obj, 'reverse', {
                    get: function () {
                        return this.order === 'desc';
                    },
                    set: function (value) {
                        this.order = (value ? 'desc' : 'asc');
                    }
                });

                return obj;
            },
            estimateCompletedPercentFromBitField: function (bitfield) {
                var totalLength = bitfield.length * 0xf;
                var completedLength = 0;

                if (totalLength == 0) {
                    return 0;
                }

                for (var i = 0; i < bitfield.length; i++) {
                    var num = parseInt(bitfield[i], 16);
                    completedLength += num;
                }

                return completedLength / totalLength;
            },
            estimateHealthPercentFromPeers: function (task, peers) {
                if (peers.length < 1) {
                    return task.completePercent;
                }

                var bitfieldCompletedArr = new Array(task.bitfield.length);
                var bitfieldPieceArr = new Array(task.bitfield.length);
                var totalLength = task.bitfield.length * 0xf;
                var healthBitCount = 0;

                for (var i = 0; i < task.bitfield.length; i++) {
                    var num = parseInt(task.bitfield[i], 16);
                    bitfieldCompletedArr[i] = 0;
                    bitfieldPieceArr[i] = 0;

                    if (num == 0xf) {
                        bitfieldCompletedArr[i] = num;
                    } else {
                        bitfieldPieceArr[i] = num;
                    }
                }

                for (var i = 0; i < peers.length; i++) {
                    var peer = peers[i];
                    var bitfield = peer.bitfield;

                    for (var j = 0; j < bitfield.length; j++) {
                        var num = parseInt(bitfield[j], 16);

                        if (num == 0xf) {
                            bitfieldCompletedArr[j] += num;
                        } else {
                            bitfieldPieceArr[j] = Math.max(bitfieldPieceArr[j], num);
                        }
                    }
                }

                for (var i = 0; i < bitfieldCompletedArr.length; i++) {
                    bitfieldCompletedArr[i] += bitfieldPieceArr[i];
                }

                while (true) {
                    var completed = true;

                    for (var i = 0; i < bitfieldCompletedArr.length; i++) {
                        if (bitfieldCompletedArr[i] > 0xf) {
                            healthBitCount += 0xf;
                            bitfieldCompletedArr[i] -= 0xf;
                        } else {
                            healthBitCount += bitfieldCompletedArr[i];
                            bitfieldCompletedArr[i] = 0;
                            completed = false;
                        }
                    }

                    if (!completed) {
                        break;
                    }
                }

                var healthPercent = healthBitCount / totalLength * 100;

                if (healthPercent < task.completePercent) {
                    healthPercent = task.completePercent;
                }

                return healthPercent;
            }
        };
    }]);
})();
