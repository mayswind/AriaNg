(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2RpcService', ['$q', 'aria2RpcConstants', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2HttpRpcService', 'aria2WebSocketRpcService', function ($q, aria2RpcConstants, ariaNgCommonService, ariaNgSettingService, aria2HttpRpcService, aria2WebSocketRpcService) {
        var protocol = ariaNgSettingService.getProtocol();
        var secret = ariaNgSettingService.getSecret();

        var checkIsSystemMethod = function (methodName) {
            return methodName.indexOf(aria2RpcConstants.rpcSystemServiceName + '.') == 0;
        };

        var getAria2MethodFullName = function (methodName) {
            return aria2RpcConstants.rpcServiceName + '.' + methodName;
        };

        var invoke = function (method, context) {
            var isSystemMethod = checkIsSystemMethod(method);
            var finalParams = [];

            if (secret && !isSystemMethod) {
                finalParams.push(aria2RpcConstants.rpcTokenPrefix + secret);
            }

            if (angular.isArray(context.params) && context.params.length > 0) {
                for (var i = 0; i < context.params.length; i++) {
                    finalParams.push(context.params[i]);
                }
            }

            context.uniqueId = ariaNgCommonService.generateUniqueId();
            context.requestBody = {
                jsonrpc: aria2RpcConstants.rpcServiceVersion,
                method: (!isSystemMethod ? getAria2MethodFullName(method) : method),
                id: context.uniqueId
            };

            if (finalParams.length > 0) {
                context.requestBody.params = finalParams;
            }

            if (!context.silent) {
                context.errorCallback = function (error) {
                    if (!error || !error.message) {
                        return;
                    }

                    if (error.message == 'Unauthorized') {
                        ariaNgCommonService.showError('rpc.error.' + error.message);
                        return;
                    }
                }
            }

            if (protocol == 'ws' || protocol == 'wss') {
                return aria2WebSocketRpcService.request(context);
            } else {
                return aria2HttpRpcService.request(context);
            }
        };

        var invokeMulti = function (methodFunc, contexts, keyProperty, callback) {
            var promises = [];
            var results = [];

            for (var i = 0; i < contexts.length; i++) {
                contexts[i].callback = function (result) {
                    results.push(result);
                };

                promises.push(methodFunc(contexts[i]));
            }

            return $q.all(promises).finally(function () {
                if (callback) {
                    callback(results);
                }
            });
        };

        var buildRequestContext = function () {
            var context = {};

            if (arguments.length > 0) {
                var invokeContext = arguments[0];

                context.silent = invokeContext.silent === true;
                context.callback = invokeContext.callback;
            }

            if (arguments.length > 1) {
                var params = [];

                for (var i = 1; i < arguments.length; i++) {
                    if (arguments[i] != null && !angular.isUndefined(arguments[i])) {
                        params.push(arguments[i]);
                    }
                }

                if (params.length > 0) {
                    context.params = params;
                }
            }

            return context;
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
                return invoke('remove', buildRequestContext(context, context.gid));
            },
            forceRemove: function (context) {
                return invoke('forceRemove', buildRequestContext(context, context.gid));
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
                return invoke('pause', buildRequestContext(context, context.gid));
            },
            pauseAll: function (context) {
                return invoke('pauseAll', buildRequestContext(context));
            },
            forcePause: function (context) {
                return invoke('forcePause', buildRequestContext(context, context.gid));
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
                return invoke('forcePauseAll', buildRequestContext(context));
            },
            unpause: function (context) {
                return invoke('unpause', buildRequestContext(context, context.gid));
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
                return invoke('unpauseAll', buildRequestContext(context));
            },
            tellStatus: function (context) {
                return invoke('tellStatus', buildRequestContext(context, context.gid));
            },
            getUris: function (context) {
                return invoke('getUris', buildRequestContext(context, context.gid));
            },
            getFiles: function (context) {
                return invoke('getFiles', buildRequestContext(context, context.gid));
            },
            getPeers: function (context) {
                return invoke('getPeers', buildRequestContext(context, context.gid));
            },
            getServers: function (context) {
                return invoke('getServers', buildRequestContext(context, context.gid));
            },
            tellActive: function (context) {
                return invoke('tellActive', buildRequestContext(context,
                    angular.isUndefined(context.requestParams) ? null : context.requestParams
                ));
            },
            tellWaiting: function (context) {
                return invoke('tellWaiting', buildRequestContext(context,
                    angular.isUndefined(context.offset) ? 0 : context.offset,
                    angular.isUndefined(context.num) ? 1000 : context.num,
                    angular.isUndefined(context.requestParams) ? null : context.requestParams
                ));
            },
            tellStopped: function (context) {
                return invoke('tellStopped', buildRequestContext(context,
                    angular.isUndefined(context.offset) ? 0 : context.offset,
                    angular.isUndefined(context.num) ? 1000 : context.num,
                    angular.isUndefined(context.requestParams) ? null : context.requestParams
                ));
            },
            changePosition: function (context) {
                return invoke('changePosition', buildRequestContext(context, context.gid, context.pos, context.how));
            },
            // changeUri: function (context) {
            //     return invoke('changeUri', context);
            // },
            getOption: function (context) {
                return invoke('getOption', buildRequestContext(context, context.gid));
            },
            changeOption: function (context) {
                return invoke('changeOption', buildRequestContext(context, context.gid, context.options));
            },
            getGlobalOption: function (context) {
                return invoke('getGlobalOption', buildRequestContext(context));
            },
            changeGlobalOption: function (context) {
                return invoke('changeGlobalOption', buildRequestContext(context, context.options));
            },
            getGlobalStat: function (context) {
                return invoke('getGlobalStat', buildRequestContext(context));
            },
            purgeDownloadResult: function (context) {
                return invoke('purgeDownloadResult', buildRequestContext(context));
            },
            removeDownloadResult: function (context) {
                return invoke('removeDownloadResult', buildRequestContext(context, context.gid));
            },
            removeDownloadResultMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.gids.length; i++) {
                    contexts.push({
                        gid: context.gids[i]
                    });
                }

                return invokeMulti(this.removeDownloadResult, contexts, 'gid', context.callback);
            },
            getVersion: function (context) {
                return invoke('getVersion', buildRequestContext(context));
            },
            getSessionInfo: function (context) {
                return invoke('getSessionInfo', buildRequestContext(context));
            },
            shutdown: function (context) {
                return invoke('shutdown', buildRequestContext(context));
            },
            forceShutdown: function (context) {
                return invoke('forceShutdown', buildRequestContext(context));
            },
            saveSession: function (context) {
                return invoke('saveSession', buildRequestContext(context));
            },
            multicall: function (context) {
                var requestContext = {
                    params: [],
                    silent: context.silent === true,
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
                return invoke('system.listMethods', buildRequestContext(context));
            }
        };
    }]);
})();
