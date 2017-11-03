(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2TaskService', ['$q', '$translate', 'bittorrentPeeridService', 'aria2Errors', 'aria2RpcService', 'ariaNgCommonService', 'ariaNgSettingService', 'ariaNgLogService', function ($q, $translate, bittorrentPeeridService, aria2Errors, aria2RpcService, ariaNgCommonService, ariaNgSettingService, ariaNgLogService) {
        var getFileName = function (file) {
            if (!file) {
                ariaNgLogService.warn('[aria2TaskService.getFileName] file is null');
                return '';
            }

            var path = file.path;

            if (!path && file.uris && file.uris.length > 0) {
                path = file.uris[0].uri;
            }

            var index = path.lastIndexOf('/');

            if (index <= 0 || index === path.length) {
                return path;
            }

            return path.substring(index + 1);
        };

        var calculateDownloadRemainTime = function (remainBytes, downloadSpeed) {
            if (downloadSpeed === 0) {
                return 0;
            }

            return remainBytes / downloadSpeed;
        };

        var getTaskName = function (task) {
            var taskName = '';
            var success = true;

            if (task.bittorrent && task.bittorrent.info) {
                taskName = task.bittorrent.info.name;
            }

            if (!taskName && task.files && task.files.length > 0) {
                taskName = getFileName(task.files[0]);
            }

            if (!taskName) {
                taskName = $translate.instant('Unknown');
                success = false;
            }

            return {
                name: taskName,
                success: success
            };
        };

        var getTaskErrorDescription = function (task) {
            if (!task.errorCode) {
                return '';
            }

            if (!aria2Errors[task.errorCode] || !aria2Errors[task.errorCode].descriptionKey) {
                return '';
            }

            if (aria2Errors[task.errorCode].hide) {
                return '';
            }

            return aria2Errors[task.errorCode].descriptionKey;
        };

        var getPieceStatus = function (bitField, pieceCount) {
            var pieces = [];

            for (var i = 0; i < pieceCount; i++) {
                pieces.push(false);
            }

            if (!bitField) {
                return pieces;
            }

            var pieceIndex = 0;

            for (var i = 0; i < bitField.length; i++) {
                var bitSet = parseInt(bitField[i], 16);

                for (var j = 1; j <= 4; j++) {
                    var bit = (1 << (4 - j));
                    var isCompleted = (bitSet & bit) === bit;

                    pieces[pieceIndex++] = isCompleted;

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

                if (combinedPieces.length > 0 && combinedPieces[combinedPieces.length - 1].isCompleted === isCompleted) {
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

        var processDownloadTask = function (task) {
            if (!task) {
                ariaNgLogService.warn('[aria2TaskService.processDownloadTask] task is null');
                return task;
            }

            var pieceStatus = getPieceStatus(task.bitfield, task.numPieces);

            task.totalLength = parseInt(task.totalLength);
            task.completedLength = parseInt(task.completedLength);
            task.completePercent = (task.totalLength > 0 ? task.completedLength / task.totalLength * 100 : 0);
            task.remainLength = task.totalLength - task.completedLength;
            task.remainPercent = 100 - task.completePercent;
            task.uploadLength = (task.uploadLength ? parseInt(task.uploadLength) : 0);
            task.shareRatio = (task.completedLength > 0 ? task.uploadLength / task.completedLength : 0);

            task.uploadSpeed = parseInt(task.uploadSpeed);
            task.downloadSpeed = parseInt(task.downloadSpeed);

            task.numPieces = parseInt(task.numPieces);
            task.completedPieces = ariaNgCommonService.countArray(pieceStatus, true);
            task.pieceLength = parseInt(task.pieceLength);

            task.idle = task.downloadSpeed === 0;
            task.remainTime = calculateDownloadRemainTime(task.remainLength, task.downloadSpeed);
            task.seeder = (task.seeder === true || task.seeder === 'true');

            var taskNameResult = getTaskName(task);
            task.taskName = taskNameResult.name;
            task.hasTaskName = taskNameResult.success;

            task.errorDescription = getTaskErrorDescription(task);

            if (task.files) {
                var selectedFileCount = 0;

                for (var i = 0; i < task.files.length; i++) {
                    var file = task.files[i];
                    file.index = parseInt(file.index);
                    file.fileName = getFileName(file);
                    file.length = parseInt(file.length);
                    file.selected = (file.selected === true || file.selected === 'true');
                    file.completedLength = parseInt(file.completedLength);
                    file.completePercent = (file.length > 0 ? file.completedLength / file.length * 100 : 0);

                    selectedFileCount += file.selected ? 1 : 0;
                }

                task.selectedFileCount = selectedFileCount;
            }

            if (task.files && task.files.length === 1 && task.files[0].uris && task.files[0].uris[0]) {
                var isSingleUrlTask = true;
                var firstUri = task.files[0].uris[0].uri;

                for (var i = 0; i < task.files[0].uris.length; i++) {
                    var uri = task.files[0].uris[i].uri;

                    if (uri !== firstUri) {
                        isSingleUrlTask = false;
                        break;
                    }
                }

                if (isSingleUrlTask) {
                    task.singleUrl = firstUri;
                }
            }

            return task;
        };

        var processBtPeers = function (peers, task, includeLocalPeer) {
            if (!peers) {
                ariaNgLogService.warn('[aria2TaskService.processBtPeers] peers is null');
                return peers;
            }

            var localTaskCompletedPieces = getPieceStatus(task.bitfield, task.numPieces);
            var localTaskCompletedPieceCount = ariaNgCommonService.countArray(localTaskCompletedPieces, true);
            var localTaskCompletedPercent = task.completePercent;

            for (var i = 0; i < peers.length; i++) {
                var peer = peers[i];
                var upstreamToSpeed = peer.uploadSpeed;
                var downstreamFromSpeed = peer.downloadSpeed;
                var completedPieces = getPieceStatus(peer.bitfield, task.numPieces);
                var completedPieceCount = ariaNgCommonService.countArray(completedPieces, true);

                peer.name = peer.ip + ':' + peer.port;
                peer.completePercent = completedPieceCount / task.numPieces * 100;
                peer.downloadSpeed = upstreamToSpeed;
                peer.uploadSpeed = downstreamFromSpeed;
                peer.seeder = (peer.seeder === true || peer.seeder === 'true');

                if (completedPieceCount === localTaskCompletedPieceCount && peer.completePercent !== localTaskCompletedPercent) {
                    peer.completePercent = localTaskCompletedPercent;
                }

                if (peer.peerId) {
                    var peerId = ariaNgCommonService.decodePercentEncodedString(peer.peerId);
                    var clientInfo = (peerId ? bittorrentPeeridService.parseClient(peerId) : null);

                    if (clientInfo && clientInfo.client !== 'unknown') {
                        var client = {
                            name: (clientInfo.client ? clientInfo.client.trim() : ''),
                            version: (clientInfo.version ? clientInfo.version.trim() : '')
                        };

                        client.info = client.name + (client.version ? ' ' + client.version : '');

                        peer.client = client;
                    }
                }
            }

            if (includeLocalPeer) {
                peers.push(createLocalPeerFromTask(task));
            }

            return peers;
        };

        var createTaskEventCallback = function (getTaskStatusFunc, callback, type) {
            return function (event) {
                var context = {
                    type: type,
                    task: null
                };

                if (event && event.gid) {
                    getTaskStatusFunc(event.gid, function (response) {
                        context.task = (response.success ? response.data : null);
                        callback(context);
                    }, true);
                } else {
                    callback(context);
                }
            };
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

                if (type === 'downloading') {
                    invokeMethod = aria2RpcService.tellActive;
                } else if (type === 'waiting') {
                    invokeMethod = aria2RpcService.tellWaiting;
                } else if (type === 'stopped') {
                    invokeMethod = aria2RpcService.tellStopped;
                } else {
                    return;
                }

                return invokeMethod({
                    requestWholeInfo: full,
                    requestParams: full ? aria2RpcService.getFullTaskParams() : aria2RpcService.getBasicTaskParams(),
                    silent: !!silent,
                    callback: function (response) {
                        if (!callback) {
                            ariaNgLogService.warn('[aria2TaskService.getTaskList] callback is null');
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
                            ariaNgLogService.warn('[aria2TaskService.getTaskStatus] callback is null');
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
            getBtTaskPeers: function (task, callback, silent, includeLocalPeer) {
                return aria2RpcService.getPeers({
                    gid: task.gid,
                    silent: !!silent,
                    callback: function (response) {
                        if (!callback) {
                            ariaNgLogService.warn('[aria2TaskService.getBtTaskPeers] callback is null');
                            return;
                        }

                        if (response.success) {
                            processBtPeers(response.data, task, includeLocalPeer);
                        }

                        callback(response);
                    }
                });
            },
            getTaskStatusAndBtPeers: function (gid, callback, silent, requirePeers, includeLocalPeer) {
                var methods = [
                    aria2RpcService.tellStatus({ gid: gid }, true)
                ];

                if (requirePeers) {
                    methods.push(aria2RpcService.getPeers({ gid: gid }, true));
                }

                return aria2RpcService.multicall({
                    methods: methods,
                    silent: !!silent,
                    callback: function (response) {
                        if (!callback) {
                            ariaNgLogService.warn('[aria2TaskService.getTaskStatusAndBtPeers] callback is null');
                            return;
                        }

                        response.task = {};

                        if (response.success && response.data.length > 0) {
                            response.task = response.data[0][0];
                            processDownloadTask(response.task);
                        }

                        if (response.success && response.task.bittorrent && response.data.length > 1) {
                            response.peers = response.data[1][0];
                            processBtPeers(response.peers, response.task, includeLocalPeer);
                        }

                        callback(response);
                    }
                });
            },
            newUriTask: function (task, pauseOnAdded, callback, silent) {
                return aria2RpcService.addUri({
                    task: task,
                    pauseOnAdded: !!pauseOnAdded,
                    silent: !!silent,
                    callback: callback
                });
            },
            newUriTasks: function (tasks, pauseOnAdded, callback, silent) {
                return aria2RpcService.addUriMulti({
                    tasks: tasks,
                    pauseOnAdded: !!pauseOnAdded,
                    silent: !!silent,
                    callback: callback
                });
            },
            newTorrentTask: function (task, pauseOnAdded, callback, silent) {
                return aria2RpcService.addTorrent({
                    task: task,
                    pauseOnAdded: !!pauseOnAdded,
                    silent: !!silent,
                    callback: callback
                });
            },
            newMetalinkTask: function (task, pauseOnAdded, callback, silent) {
                return aria2RpcService.addMetalink({
                    task: task,
                    pauseOnAdded: !!pauseOnAdded,
                    silent: !!silent,
                    callback: callback
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
            restartTask: function (gid, callback, silent) {
                var deferred = $q.defer();

                var methods = [
                    aria2RpcService.tellStatus({gid: gid}, true),
                    aria2RpcService.getOption({gid: gid}, true)
                ];

                var task = null, options = null;

                aria2RpcService.multicall({
                    methods: methods,
                    silent: !!silent,
                    callback: function (response) {
                        if (!callback) {
                            ariaNgLogService.warn('[aria2TaskService.restartTask] callback is null');
                            return;
                        }

                        if (!response.success) {
                            ariaNgLogService.warn('[aria2TaskService.restartTask] response is not success');
                            deferred.reject(response);
                            callback(response);
                            return;
                        }

                        if (response.data.length > 0) {
                            task = response.data[0][0];
                        }

                        if (response.data.length > 1) {
                            options = response.data[1][0];
                        }

                        if (!task || !options || !task.files || task.files.length != 1 || task.bittorrent) {
                            if (!task) {
                                ariaNgLogService.warn('[aria2TaskService.restartTask] task is null');
                            }

                            if (!options) {
                                ariaNgLogService.warn('[aria2TaskService.restartTask] options is null');
                            }

                            if (!task.files) {
                                ariaNgLogService.warn('[aria2TaskService.restartTask] task file is null');
                            }

                            if (task.files.length !== 1) {
                                ariaNgLogService.warn('[aria2TaskService.restartTask] task file length is not equal 1');
                            }

                            if (task.bittorrent) {
                                ariaNgLogService.warn('[aria2TaskService.restartTask] task is bittorrent');
                            }

                            deferred.reject(gid);
                            callback({
                                success: false
                            });
                            return;
                        }

                        var file = task.files[0];
                        var urls = [];

                        for (var i = 0; i < file.uris.length; i++) {
                            var uriObj = file.uris[i];
                            urls.push(uriObj.uri);
                        }

                        aria2RpcService.addUri({
                            task: {
                                urls: urls,
                                options: options
                            },
                            pauseOnAdded: false,
                            silent: !!silent,
                            callback: function (response) {
                                if (!response.success) {
                                    ariaNgLogService.warn('[aria2TaskService.restartTask] addUri response is not success');
                                    deferred.reject(response);
                                    callback(response);
                                    return;
                                }

                                if (ariaNgSettingService.getRemoveOldTaskAfterRestarting()) {
                                    aria2RpcService.removeDownloadResult({
                                        gid: gid,
                                        silent: true,
                                        callback: function (response) {
                                            if (!response.success) {
                                                ariaNgLogService.warn('[aria2TaskService.restartTask] removeDownloadResult response is not success');
                                            }
                                        }
                                    });
                                }

                                deferred.resolve(response);
                                callback(response);
                            }
                        });
                    }
                });

                return deferred.promise;
            },
            removeTasks: function (tasks, callback, silent) {
                var runningTaskGids = [];
                var stoppedTaskGids = [];

                for (var i = 0; i < tasks.length; i++) {
                    if (tasks[i].status === 'complete' || tasks[i].status === 'error' || tasks[i].status === 'removed') {
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
                });
            },
            clearStoppedTasks: function (callback, silent) {
                return aria2RpcService.purgeDownloadResult({
                    silent: !!silent,
                    callback: callback
                });
            },
            onFirstSuccess: function (callback) {
                if (!callback) {
                    ariaNgLogService.warn('[aria2TaskService.onFirstSuccess] callback is null');
                    return;
                }

                aria2RpcService.onFirstSuccess({
                    callback: callback
                });
            },
            onConnectSuccess: function (callback) {
                if (!callback) {
                    ariaNgLogService.warn('[aria2TaskService.onConnectSuccess] callback is null');
                    return;
                }

                aria2RpcService.onConnectSuccess({
                    callback: callback
                });
            },
            onConnectError: function (callback) {
                if (!callback) {
                    ariaNgLogService.warn('[aria2TaskService.onConnectError] callback is null');
                    return;
                }

                aria2RpcService.onConnectError({
                    callback: callback
                });

            },
            onTaskCompleted: function (callback) {
                if (!callback) {
                    ariaNgLogService.warn('[aria2TaskService.onTaskCompleted] callback is null');
                    return;
                }

                aria2RpcService.onDownloadComplete({
                    callback: createTaskEventCallback(this.getTaskStatus, callback, 'completed')
                });
            },
            onBtTaskCompleted: function (callback) {
                if (!callback) {
                    ariaNgLogService.warn('[aria2TaskService.onBtTaskCompleted] callback is null');
                    return;
                }

                aria2RpcService.onBtDownloadComplete({
                    callback: createTaskEventCallback(this.getTaskStatus, callback, 'btcompleted')
                });
            },
            onTaskErrorOccur: function (callback) {
                if (!callback) {
                    ariaNgLogService.warn('[aria2TaskService.onTaskErrorOccur] callback is null');
                    return;
                }

                aria2RpcService.onDownloadError({
                    callback: createTaskEventCallback(this.getTaskStatus, callback, 'error')
                });
            },
            processDownloadTasks: function (tasks) {
                if (!angular.isArray(tasks)) {
                    ariaNgLogService.warn('[aria2TaskService.processDownloadTasks] tasks is not array');
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
                if (!task || task.numPieces < 1 || peers.length < 1) {
                    ariaNgLogService.warn('[aria2TaskService.estimateHealthPercentFromPeers] tasks is null or numPieces < 1 or peers < 1');
                    return task.completePercent;
                }

                var totalPieces = [];
                var maxCompletedPieceCount = 0;
                var maxCompletedPercent = task.completePercent;

                for (var i = 0; i < task.numPieces; i++) {
                    totalPieces.push(0);
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
                    } else if (completedPieceCount === maxCompletedPieceCount && peer.completePercent > maxCompletedPercent) {
                        maxCompletedPercent = peer.completePercent;
                    }
                }

                var totalCompletedPieceCount = 0;

                if (totalPieces.length > 0) {
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
}());
