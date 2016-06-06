(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2SettingService', ['aria2AllOptions', 'aria2GlobalAvailableOptions', 'aria2TaskAvailableOptions', 'ariaNgCommonService', 'aria2RpcService', function (aria2AllOptions, aria2GlobalAvailableOptions, aria2TaskAvailableOptions, ariaNgCommonService, aria2RpcService) {
        var processStatResult = function (stat) {
            if (!stat) {
                return stat;
            }

            var activeCount = parseInt(stat.numActive);
            var waitingCount = parseInt(stat.numWaiting);
            var totalRunningCount = activeCount + waitingCount;

            stat.totalRunningCount = totalRunningCount;

            return stat;
        };

        return {
            getAvailableGlobalOptionsKeys: function (type) {
                if (type == 'basic') {
                    return aria2GlobalAvailableOptions.basicOptions;
                } else if (type == 'http-ftp-sftp') {
                    return aria2GlobalAvailableOptions.httpFtpSFtpOptions;
                } else if (type == 'http') {
                    return aria2GlobalAvailableOptions.httpOptions;
                } else if (type == 'ftp-sftp') {
                    return aria2GlobalAvailableOptions.ftpSFtpOptions;
                } else if (type == 'bt') {
                    return aria2GlobalAvailableOptions.btOptions;
                } else if (type == 'metalink') {
                    return aria2GlobalAvailableOptions.metalinkOptions;
                } else if (type == 'rpc') {
                    return aria2GlobalAvailableOptions.rpcOptions;
                } else if (type == 'advanced') {
                    return aria2GlobalAvailableOptions.advancedOptions;
                } else {
                    return false;
                }
            },
            getAvailableTaskOptionKeys: function (status, isBittorrent) {
                if (status == 'active' && isBittorrent) {
                    return {
                        readwrite: aria2TaskAvailableOptions.activeBtTaskOptions,
                        readonly: aria2TaskAvailableOptions.activeTaskReadonlyOptions
                    };
                } else if (status == 'active' && !isBittorrent) {
                    return {
                        readwrite: aria2TaskAvailableOptions.activeNormalTaskOptions,
                        readonly: aria2TaskAvailableOptions.activeTaskReadonlyOptions
                    };
                } else if ((status == 'waiting' || status == 'paused') && isBittorrent) {
                    return {
                        readwrite: aria2TaskAvailableOptions.inactiveBtTaskOptions,
                        readonly: []
                    };
                } else if ((status == 'waiting' || status == 'paused') && !isBittorrent) {
                    return {
                        readwrite: aria2TaskAvailableOptions.inactiveNormalTaskOptions,
                        readonly: []
                    };
                } else {
                    return false;
                }
            },
            getSpecifiedOptions: function (keys, readonly) {
                var options = [];

                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var option = aria2AllOptions[key];

                    if (!option) {
                        continue;
                    }

                    option = angular.extend({
                        key: key,
                        nameKey: 'options.' + key + '.name',
                        descriptionKey: 'options.' + key + '.description'
                    }, option);

                    if (option.type == 'boolean') {
                        option.options = ['true', 'false'];
                    }
                    
                    if (!!readonly) {
                        option.readonly = true;
                    }

                    if (option.options) {
                        var availableOptions = [];

                        for (var j = 0; j < option.options.length; j++) {
                            availableOptions.push({
                                name: 'options.' + option.options[j],
                                value: option.options[j]
                            });
                        }

                        option.options = availableOptions;
                    }

                    options.push(option);
                }

                return options;
            },
            getGlobalOption: function (callback) {
                return aria2RpcService.getGlobalOption({
                    callback: callback
                });
            },
            setGlobalOption: function (key, value, callback) {
                var data = {};
                data[key] = value;

                return aria2RpcService.changeGlobalOption({
                    options: data,
                    callback: callback
                });
            },
            getServerStatus: function (callback) {
                return aria2RpcService.getVersion({
                    callback: callback
                })
            },
            getGlobalStat: function (callback, silent) {
                return aria2RpcService.getGlobalStat({
                    silent: !!silent,
                    callback: function (result) {
                        if (!callback) {
                            return;
                        }

                        var stat = processStatResult(result);
                        callback(stat);
                    }
                });
            },
            saveSession: function (callback) {
                return aria2RpcService.saveSession({
                    callback: callback
                })
            },
            shutdown: function (callback) {
                return aria2RpcService.shutdown({
                    callback: callback
                })
            }
        };
    }]);
})();
