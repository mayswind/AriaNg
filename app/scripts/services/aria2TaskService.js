(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2TaskService', ['$q', '$translate', 'aria2RpcService', 'ariaNgCommonService', function ($q, $translate, aria2RpcService, ariaNgCommonService) {
        var getFileNameFromPath = function (path) {
            if (!path) {
                return path;
            }

            var index = path.lastIndexOf('/');

            if (index <= 0 || index == path.length) {
                return path;
            }

            return path.substring(index + 1);
        };

        var calculateDownloadRemainTime = function (remainBytes, downloadSpeed) {
            if (downloadSpeed == 0) {
                return 0;
            }

            return remainBytes / downloadSpeed;
        };

        var getTaskName = function (task) {
            var taskName = "";

            if (task.bittorrent && task.bittorrent.info) {
                taskName = task.bittorrent.info.name;
            }

            if (!taskName && task.files && task.files.length >= 1) {
                taskName = getFileNameFromPath(task.files[0].path);
            }

            if (!taskName && task.files && task.files.length >= 1 && task.files[0].uris && task.files[0].uris.length >= 1) {
                taskName = getFileNameFromPath(task.files[0].uris[0].uri);
            }

            if (!taskName) {
                taskName = $translate.instant('Unknown');
            }

            return taskName;
        };

        var processDownloadTask = function (task) {
            if (!task) {
                return task;
            }

            task.totalLength = parseInt(task.totalLength);
            task.completedLength = parseInt(task.completedLength);
            task.completePercent = (task.totalLength > 0 ? task.completedLength / task.totalLength * 100 : 0);
            task.remainLength = task.totalLength - task.completedLength;
            task.remainPercent = 100 - task.completePercent;
            task.uploadLength = (task.uploadLength ? parseInt(task.uploadLength) : 0);
            task.shareRatio = (task.uploadLength / task.completedLength);

            task.uploadSpeed = parseInt(task.uploadSpeed);
            task.downloadSpeed = parseInt(task.downloadSpeed);

            task.taskName = getTaskName(task);
            task.idle = task.downloadSpeed == 0;

            task.remainTime = calculateDownloadRemainTime(task.remainLength, task.downloadSpeed);

            if (task.files) {
                for (var i = 0; i < task.files.length; i++) {
                    var file = task.files[i];
                    file.fileName = getFileNameFromPath(file.path);
                    file.length = parseInt(file.length);
                    file.selected = (file.selected == 'true');
                    file.completedLength = parseInt(file.completedLength);
                    file.completePercent = (file.length > 0 ? file.completedLength / file.length * 100 : 0);
                }
            }

            return task;
        };

        var getPieceStatus = function (bitField, pieceCount) {
            var pieces = [];

            if (!bitField) {
                return pieces;
            }

            var pieceIndex = 0;

            for (var i = 0; i < bitField.length; i++) {
                var bitSet = parseInt(bitField[i], 16);

                for (var j = 1; j <= 4; j++) {
                    var bit = (1 << (4 - j));
                    var isCompleted = (bitSet & bit) == bit;

                    pieces.push(isCompleted);
                    pieceIndex++;

                    if (pieceIndex >= pieceCount) {
                        return pieces;
                    }
                }
            }

            return pieces;
        };

        var getCombinedPieces = function (bitField, pieceCount) {
            var pieces = getPieceStatus(bitField, pieceCount);
            var combinedPieces = [];

            for (var i = 0; i < pieces.length; i++) {
                var isCompleted = pieces[i];

                if (combinedPieces.length > 0 && combinedPieces[combinedPieces.length - 1].isCompleted == isCompleted) {
                    combinedPieces[combinedPieces.length - 1].count++;
                } else {
                    combinedPieces.push({
                        isCompleted: isCompleted,
                        count: 1
                    });
                }
            }

            return combinedPieces;
        };

        var createLocalPeerFromTask = function (task) {
            return {
                local: true,
                bitfield: task.bitfield,
                completePercent: task.completePercent,
                downloadSpeed: task.downloadSpeed,
                name: '(local)',
                seeder: task.seeder,
                uploadSpeed: task.uploadSpeed
            };
        };

        return {
            getTaskList: function (type, full, callback, silent) {
                var invokeMethod = null;

                if (type == 'downloading') {
                    invokeMethod = aria2RpcService.tellActive;
                } else if (type == 'waiting') {
                    invokeMethod = aria2RpcService.tellWaiting;
                } else if (type == 'stopped') {
                    invokeMethod = aria2RpcService.tellStopped;
                } else {
                    return;
                }

                return invokeMethod({
                    requestParams: full ? aria2RpcService.getFullTaskParams() : aria2RpcService.getBasicTaskParams(),
                    silent: !!silent,
                    callback: function (response) {
                        if (!callback) {
                            return;
                        }

                        callback(response);
                    }
                });
            },
            getTaskStatus: function (gid, callback, silent) {
                return aria2RpcService.tellStatus({
                    gid: gid,
                    silent: !!silent,
                    callback: function (response) {
                        if (!callback) {
                            return;
                        }

                        if (response.success) {
                            processDownloadTask(response.data);
                        }

                        callback(response);
                    }
                });
            },
            getTaskOptions: function (gid, callback, silent) {
                return aria2RpcService.getOption({
                    gid: gid,
                    silent: !!silent,
                    callback: callback
                });
            },
            setTaskOption: function (gid, key, value, callback, silent) {
                var data = {};
                data[key] = value;

                return aria2RpcService.changeOption({
                    gid: gid,
                    options: data,
                    silent: !!silent,
                    callback: callback
                });
            },
            selectTaskFile: function (gid, selectedFileIndexArr, callback, silent) {
                var selectedFileIndex = '';

                for (var i = 0; i < selectedFileIndexArr.length; i++) {
                    if (selectedFileIndex.length > 0) {
                        selectedFileIndex += ',';
                    }

                    selectedFileIndex += selectedFileIndexArr[i];
                }

                return this.setTaskOption(gid, 'select-file', selectedFileIndex, callback, silent);
            },
            getBtTaskPeers: function (task, callback, silent, includeLocal) {
                return aria2RpcService.getPeers({
                    gid: task.gid,
                    silent: !!silent,
                    callback: function (response) {
                        if (!callback) {
                            return;
                        }

                        if (response.success) {
                            var peers = response.data;

                            for (var i = 0; i < peers.length; i++) {
                                var peer = peers[i];
                                var upstreamToSpeed = peer.uploadSpeed;
                                var downstreamFromSpeed = peer.downloadSpeed;
                                var completedPieces = getPieceStatus(peer.bitfield, task.numPieces);

                                peer.name = peer.ip + ':' + peer.port;
                                peer.completePercent = ariaNgCommonService.countArray(completedPieces, true) / task.numPieces * 100;
                                peer.downloadSpeed = upstreamToSpeed;
                                peer.uploadSpeed = downstreamFromSpeed;
                            }

                            if (includeLocal) {
                                peers.push(createLocalPeerFromTask(task));
                            }
                        }

                        callback(response);
                    }
                });
            },
            startTasks: function (gids, callback, silent) {
                return aria2RpcService.unpauseMulti({
                    gids: gids,
                    silent: !!silent,
                    callback: callback
                });
            },
            pauseTasks: function (gids, callback, silent) {
                return aria2RpcService.forcePauseMulti({
                    gids: gids,
                    silent: !!silent,
                    callback: callback
                });
            },
            removeTasks: function (tasks, callback, silent) {
                var runningTaskGids = [];
                var stoppedTaskGids = [];

                for (var i = 0; i < tasks.length; i++) {
                    if (tasks[i].status == 'complete' || tasks[i].status == 'error' || tasks[i].status == 'removed') {
                        stoppedTaskGids.push(tasks[i].gid);
                    } else {
                        runningTaskGids.push(tasks[i].gid);
                    }
                }

                var promises = [];

                var hasSuccess = false;
                var hasError = false;
                var results = [];

                if (runningTaskGids.length > 0) {
                    promises.push(aria2RpcService.forceRemoveMulti({
                        gids: runningTaskGids,
                        silent: !!silent,
                        callback: function (response) {
                            ariaNgCommonService.pushArrayTo(results, response.results);
                            hasSuccess = hasSuccess | response.hasSuccess;
                            hasError = hasError | response.hasError;
                        }
                    }));
                }

                if (stoppedTaskGids.length > 0) {
                    promises.push(aria2RpcService.removeDownloadResultMulti({
                        gids: stoppedTaskGids,
                        silent: !!silent,
                        callback: function (response) {
                            ariaNgCommonService.pushArrayTo(results, response.results);
                            hasSuccess = hasSuccess | response.hasSuccess;
                            hasError = hasError | response.hasError;
                        }
                    }));
                }

                return $q.all(promises).then(function () {
                    if (callback) {
                        callback({
                            hasSuccess: !!hasSuccess,
                            hasError: !!hasError,
                            results: results
                        });
                    }
                });
            },
            changeTaskPosition: function (gid, position, callback, silent) {
                return aria2RpcService.changePosition({
                    gid: gid,
                    pos: position,
                    how: 'POS_SET',
                    silent: !!silent,
                    callback: callback
                })
            },
            clearStoppedTasks: function (callback, silent) {
                return aria2RpcService.purgeDownloadResult({
                    silent: !!silent,
                    callback: callback
                });
            },
            processDownloadTasks: function (tasks) {
                if (!angular.isArray(tasks)) {
                    return;
                }

                for (var i = 0; i < tasks.length; i++) {
                    processDownloadTask(tasks[i]);
                }
            },
            getPieceStatus: function (bitField, pieceCount) {
                return getPieceStatus(bitField, pieceCount);
            },
            getCombinedPieces: function (bitField, pieceCount) {
                return getCombinedPieces(bitField, pieceCount);
            },
            estimateHealthPercentFromPeers: function (task, peers) {
                if (peers.length < 1) {
                    return task.completePercent;
                }

                var totalPieces = [];
                var currentPieces = getPieceStatus(task.bitfield, task.numPieces);
                var maxCompletedPieceCount = 0;
                var maxCompletedPercent = task.completePercent;

                for (var i = 0; i < currentPieces.length; i++) {
                    var count = currentPieces[i] ? 1 : 0;
                    totalPieces.push(count);
                    maxCompletedPieceCount += count;
                }

                for (var i = 0; i < peers.length; i++) {
                    var peer = peers[i];
                    var peerPieces = getPieceStatus(peer.bitfield, task.numPieces);
                    var completedPieceCount = 0;

                    for (var j = 0; j < peerPieces.length; j++) {
                        var count = (peerPieces[j] ? 1 : 0);
                        totalPieces[j] += count;
                        completedPieceCount += count;
                    }

                    if (completedPieceCount > maxCompletedPieceCount) {
                        maxCompletedPieceCount = completedPieceCount;
                        maxCompletedPercent = peer.completePercent;
                    } else if (completedPieceCount == maxCompletedPieceCount && peer.completePercent > maxCompletedPercent) {
                        maxCompletedPercent = peer.completePercent;
                    }
                }

                var totalCompletedPieceCount = 0;

                while (true) {
                    var completed = true;

                    for (var i = 0; i < totalPieces.length; i++) {
                        if (totalPieces[i] > 0) {
                            totalCompletedPieceCount++;
                            totalPieces[i]--;
                        } else {
                            completed = false;
                        }
                    }

                    if (!completed) {
                        break;
                    }
                }

                if (totalCompletedPieceCount <= maxCompletedPieceCount) {
                    return maxCompletedPercent;
                }

                var healthPercent = totalCompletedPieceCount / task.numPieces * 100;

                if (healthPercent <= maxCompletedPercent) {
                    return maxCompletedPercent;
                }

                return healthPercent;
            }
        };
    }]);
})();
