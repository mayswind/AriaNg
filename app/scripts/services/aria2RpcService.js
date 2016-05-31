(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2RpcService', ['$q', 'aria2RpcConstants', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2HttpRpcService', 'aria2WebSocketRpcService', function ($q, aria2RpcConstants, ariaNgCommonService, ariaNgSettingService, aria2HttpRpcService, aria2WebSocketRpcService) {
        var protocol = ariaNgSettingService.getProtocol();

        var getAria2MethodFullName = function (methodName) {
            return aria2RpcConstants.rpcServiceName + '.' + methodName;
        };

        var invoke = function (method, context) {
            context.uniqueId = ariaNgCommonService.generateUniqueId();
            context.requestBody = {
                jsonrpc: aria2RpcConstants.rpcServiceVersion,
                method: (method.indexOf(aria2RpcConstants.rpcSystemServiceName +  '.') != 0 ? getAria2MethodFullName(method) : method),
                id: context.uniqueId,
                params: context.params
            };

            if (protocol == 'ws') {
                return aria2WebSocketRpcService.request(context);
            } else {
                return aria2HttpRpcService.request(context);
            }
        };

        var invokeMulti = function (methodFunc, contexts, keyProperty, callback) {
            var promises = [];
            var results = {};

            for (var i = 0; i < contexts.length; i++) {
                contexts[i].callback = function (result) {
                    var key = this[keyProperty];
                    results[key] = result;
                };

                promises.push(methodFunc(contexts[i]));
            }

            return $q.all(promises).then(function () {
                if (callback) {
                    callback(results);
                }
            });
        };

        return {
            getBasicTaskParams: function () {
                return [
                    'gid',
                    'totalLength',
                    'completedLength',
                    'uploadSpeed',
                    'downloadSpeed',
                    'connections',
                    'numSeeders',
                    'seeder',
                    'status'
                ];
            },
            getFullTaskParams: function () {
                var requestParams = this.getBasicTaskParams();

                requestParams.push('files');
                requestParams.push('bittorrent');

                return requestParams;
            },
            // addUri: function (context) {
            //     return invoke('addUri', context);
            // },
            // addTorrent: function (context) {
            //     return invoke('addTorrent', context);
            // },
            // addMetalink: function (context) {
            //     return invoke('addMetalink', context);
            // },
            remove: function (context) {
                return invoke('remove', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            forceRemove: function (context) {
                return invoke('forceRemove', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            forceRemoveMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.gids.length; i++) {
                    contexts.push({
                        gid: context.gids[i]
                    });
                }

                return invokeMulti(this.forceRemove, contexts, 'gid', context.callback);
            },
            pause: function (context) {
                return invoke('pause', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            pauseAll: function (context) {
                return invoke('pauseAll', {
                    callback: context.callback
                });
            },
            forcePause: function (context) {
                return invoke('forcePause', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            forcePauseMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.gids.length; i++) {
                    contexts.push({
                        gid: context.gids[i]
                    });
                }

                return invokeMulti(this.forcePause, contexts, 'gid', context.callback);
            },
            forcePauseAll: function (context) {
                return invoke('forcePauseAll', {
                    callback: context.callback
                });
            },
            unpause: function (context) {
                return invoke('unpause', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            unpauseMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.gids.length; i++) {
                    contexts.push({
                        gid: context.gids[i]
                    });
                }

                return invokeMulti(this.unpause, contexts, 'gid', context.callback);
            },
            unpauseAll: function (context) {
                return invoke('unpauseAll', {
                    callback: context.callback
                });
            },
            tellStatus: function (context) {
                return invoke('tellStatus', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            getUris: function (context) {
                return invoke('getUris', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            getFiles: function (context) {
                return invoke('getFiles', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            getPeers: function (context) {
                return invoke('getPeers', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            getServers: function (context) {
                return invoke('getServers', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            tellActive: function (context) {
                var requestContext = {
                    callback: context.callback
                };

                if (context.requestParams) {
                    requestContext.params = [context.requestParams];
                }

                return invoke('tellActive', requestContext);
            },
            tellWaiting: function (context) {
                var requestContext = {
                    params: [0, 1000],
                    callback: context.callback
                };

                if (!angular.isUndefined(context.offset)) {
                    requestContext.params[0] = context.offset;
                }

                if (!angular.isUndefined(context.num)) {
                    requestContext.params[1] = context.num;
                }

                if (context.requestParams) {
                    requestContext.params.push(context.requestParams);
                }

                return invoke('tellWaiting', requestContext);
            },
            tellStopped: function (context) {
                var requestContext = {
                    params: [0, 1000],
                    callback: context.callback
                };

                if (!angular.isUndefined(context.offset)) {
                    requestContext.params[0] = context.offset;
                }

                if (!angular.isUndefined(context.num)) {
                    requestContext.params[1] = context.num;
                }

                if (context.requestParams) {
                    requestContext.params.push(context.requestParams);
                }

                return invoke('tellStopped', requestContext);
            },
            changePosition: function (context) {
                return invoke('changePosition', {
                    params: [context.gid, context.pos, context.how],
                    callback: context.callback
                });
            },
            // changeUri: function (context) {
            //     return invoke('changeUri', context);
            // },
            getOption: function (context) {
                return invoke('getOption', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            changeOption: function (context) {
                return invoke('changeOption', {
                    params: [context.gid, context.options],
                    callback: context.callback
                });
            },
            getGlobalOption: function (context) {
                return invoke('getGlobalOption', {
                    callback: context.callback
                });
            },
            changeGlobalOption: function (context) {
                return invoke('changeGlobalOption', {
                    params: [context.options],
                    callback: context.callback
                });
            },
            getGlobalStat: function (context) {
                return invoke('getGlobalStat', {
                    callback: context.callback
                });
            },
            purgeDownloadResult: function (context) {
                return invoke('purgeDownloadResult', {
                    callback: context.callback
                });
            },
            removeDownloadResult: function (context) {
                return invoke('removeDownloadResult', {
                    params: [context.gid],
                    callback: context.callback
                });
            },
            getVersion: function (context) {
                return invoke('getVersion', {
                    callback: context.callback
                });
            },
            getSessionInfo: function (context) {
                return invoke('getSessionInfo', {
                    callback: context.callback
                });
            },
            shutdown: function (context) {
                return invoke('shutdown', {
                    callback: context.callback
                });
            },
            forceShutdown: function (context) {
                return invoke('forceShutdown', {
                    callback: context.callback
                });
            },
            saveSession: function (context) {
                return invoke('saveSession', {
                    callback: context.callback
                });
            },
            multicall: function (context) {
                var requestContext = {
                    params: [],
                    callback: context.callback
                };

                if (angular.isArray(context.methods) && context.methods.length > 0) {
                    for (var i = 0; i < context.methods.length; i++) {
                        var method = context.methods[i];
                        requestContext.params.push([method]);
                    }
                }

                return invoke('system.multicall', requestContext);
            },
            listMethods: function (context) {
                return invoke('system.listMethods', {
                    callback: context.callback
                });
            }
        };
    }]);
})();
