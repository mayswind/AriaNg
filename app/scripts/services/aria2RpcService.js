(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2RpcService', ['$q', 'aria2RpcConstants', 'aria2RpcErrors', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2HttpRpcService', 'aria2WebSocketRpcService', function ($q, aria2RpcConstants, aria2RpcErrors, ariaNgCommonService, ariaNgSettingService, aria2HttpRpcService, aria2WebSocketRpcService) {
        var protocol = ariaNgSettingService.getProtocol();
        var secret = ariaNgSettingService.getSecret();

        var checkIsSystemMethod = function (methodName) {
            return methodName.indexOf(aria2RpcConstants.rpcSystemServiceName + '.') == 0;
        };

        var getAria2MethodFullName = function (methodName) {
            return aria2RpcConstants.rpcServiceName + '.' + methodName;
        };

        var invoke = function (context) {
            var uniqueId = ariaNgCommonService.generateUniqueId();

            var requestBody = {
                jsonrpc: aria2RpcConstants.rpcServiceVersion,
                method: context.methodName,
                id: uniqueId,
                params: context.params
            };

            var requestContext = {
                uniqueId: uniqueId,
                requestBody: requestBody,
                successCallback: context.successCallback,
                errorCallback: context.errorCallback
            };

            if (protocol == 'ws' || protocol == 'wss') {
                return aria2WebSocketRpcService.request(requestContext);
            } else {
                return aria2HttpRpcService.request(requestContext);
            }
        };

        var invokeMulti = function (methodFunc, contexts, callback) {
            var promises = [];

            var hasSuccess = false;
            var hasError = false;
            var results = [];

            for (var i = 0; i < contexts.length; i++) {
                contexts[i].callback = function (response) {
                    results.push(response);

                    hasSuccess = hasSuccess | response.success;
                    hasError = hasError | !response.success;
                };

                promises.push(methodFunc(contexts[i]));
            }

            return $q.all(promises).finally(function () {
                if (callback) {
                    callback({
                        hasSuccess: !!hasSuccess,
                        hasError: !!hasError,
                        results: results
                    });
                }
            });
        };

        var processError = function (error) {
            if (!error || !error.message) {
                return false;
            }

            if (error.message == aria2RpcErrors.Unauthorized.message) {
                ariaNgCommonService.showError('rpc.error.' + error.message);
                return true;
            } else {
                ariaNgCommonService.showError(error.message);
                return true;
            }
        };

        var buildRequestContext = function () {
            var methodName = arguments[0];
            var isSystemMethod = checkIsSystemMethod(methodName);
            var finalParams = [];

            var context = {
                methodName: (!isSystemMethod ? getAria2MethodFullName(methodName) : methodName)
            };

            if (secret && !isSystemMethod) {
                finalParams.push(aria2RpcConstants.rpcTokenPrefix + secret);
            }

            if (arguments.length > 1) {
                var invokeContext = arguments[1];

                context.successCallback = function (id, result) {
                    if (invokeContext.callback) {
                        invokeContext.callback({
                            id: id,
                            success: true,
                            data: result
                        });
                    }
                };

                context.errorCallback = function (id, error) {
                    var errorProcessed = false;

                    if (!invokeContext.silent) {
                        errorProcessed = processError(error);
                    }

                    if (invokeContext.callback) {
                        invokeContext.callback({
                            id: id,
                            success: false,
                            data: error,
                            errorProcessed: errorProcessed
                        });
                    }
                };
            }

            if (arguments.length > 2) {
                for (var i = 2; i < arguments.length; i++) {
                    if (arguments[i] != null && !angular.isUndefined(arguments[i])) {
                        finalParams.push(arguments[i]);
                    }
                }
            }

            if (finalParams.length > 0) {
                context.params = finalParams;
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
            addUri: function (context) {
                return invoke(buildRequestContext('addUri', context, context.urls, context.options));
            },
            addUriMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.tasks.length; i++) {
                    var task = context.tasks[i];
                    var options = angular.copy(task.options);

                    if (context.pauseOnAdded) {
                        options.pause = 'true';
                    }

                    contexts.push({
                        silent: !!context.silent,
                        urls: task.urls,
                        options: options
                    });
                }

                return invokeMulti(this.addUri, contexts, context.callback);
            },
            // addTorrent: function (context) {
            //     return invoke('addTorrent', context);
            // },
            // addMetalink: function (context) {
            //     return invoke('addMetalink', context);
            // },
            remove: function (context) {
                return invoke(buildRequestContext('remove', context, context.gid));
            },
            forceRemove: function (context) {
                return invoke(buildRequestContext('forceRemove', context, context.gid));
            },
            forceRemoveMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.gids.length; i++) {
                    contexts.push({
                        silent: !!context.silent,
                        gid: context.gids[i]
                    });
                }

                return invokeMulti(this.forceRemove, contexts, context.callback);
            },
            pause: function (context) {
                return invoke(buildRequestContext('pause', context, context.gid));
            },
            pauseAll: function (context) {
                return invoke(buildRequestContext('pauseAll', context));
            },
            forcePause: function (context) {
                return invoke(buildRequestContext('forcePause', context, context.gid));
            },
            forcePauseMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.gids.length; i++) {
                    contexts.push({
                        silent: !!context.silent,
                        gid: context.gids[i]
                    });
                }

                return invokeMulti(this.forcePause, contexts, context.callback);
            },
            forcePauseAll: function (context) {
                return invoke(buildRequestContext('forcePauseAll', context));
            },
            unpause: function (context) {
                return invoke(buildRequestContext('unpause', context, context.gid));
            },
            unpauseMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.gids.length; i++) {
                    contexts.push({
                        silent: !!context.silent,
                        gid: context.gids[i]
                    });
                }

                return invokeMulti(this.unpause, contexts, context.callback);
            },
            unpauseAll: function (context) {
                return invoke(buildRequestContext('unpauseAll', context));
            },
            tellStatus: function (context) {
                return invoke(buildRequestContext('tellStatus', context, context.gid));
            },
            getUris: function (context) {
                return invoke(buildRequestContext('getUris', context, context.gid));
            },
            getFiles: function (context) {
                return invoke(buildRequestContext('getFiles', context, context.gid));
            },
            getPeers: function (context) {
                return invoke(buildRequestContext('getPeers', context, context.gid));
            },
            getServers: function (context) {
                return invoke(buildRequestContext('getServers', context, context.gid));
            },
            tellActive: function (context) {
                return invoke(buildRequestContext('tellActive', context,
                    angular.isUndefined(context.requestParams) ? null : context.requestParams
                ));
            },
            tellWaiting: function (context) {
                return invoke(buildRequestContext('tellWaiting', context,
                    angular.isUndefined(context.offset) ? 0 : context.offset,
                    angular.isUndefined(context.num) ? 1000 : context.num,
                    angular.isUndefined(context.requestParams) ? null : context.requestParams
                ));
            },
            tellStopped: function (context) {
                return invoke(buildRequestContext('tellStopped', context,
                    angular.isUndefined(context.offset) ? 0 : context.offset,
                    angular.isUndefined(context.num) ? 1000 : context.num,
                    angular.isUndefined(context.requestParams) ? null : context.requestParams
                ));
            },
            changePosition: function (context) {
                return invoke(buildRequestContext('changePosition', context, context.gid, context.pos, context.how));
            },
            // changeUri: function (context) {
            //     return invoke('changeUri', context);
            // },
            getOption: function (context) {
                return invoke(buildRequestContext('getOption', context, context.gid));
            },
            changeOption: function (context) {
                return invoke(buildRequestContext('changeOption', context, context.gid, context.options));
            },
            getGlobalOption: function (context) {
                return invoke(buildRequestContext('getGlobalOption', context));
            },
            changeGlobalOption: function (context) {
                return invoke(buildRequestContext('changeGlobalOption', context, context.options));
            },
            getGlobalStat: function (context) {
                return invoke(buildRequestContext('getGlobalStat', context));
            },
            purgeDownloadResult: function (context) {
                return invoke(buildRequestContext('purgeDownloadResult', context));
            },
            removeDownloadResult: function (context) {
                return invoke(buildRequestContext('removeDownloadResult', context, context.gid));
            },
            removeDownloadResultMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.gids.length; i++) {
                    contexts.push({
                        silent: !!context.silent,
                        gid: context.gids[i]
                    });
                }

                return invokeMulti(this.removeDownloadResult, contexts, context.callback);
            },
            getVersion: function (context) {
                return invoke(buildRequestContext('getVersion', context));
            },
            getSessionInfo: function (context) {
                return invoke(buildRequestContext('getSessionInfo', context));
            },
            shutdown: function (context) {
                return invoke(buildRequestContext('shutdown', context));
            },
            forceShutdown: function (context) {
                return invoke(buildRequestContext('forceShutdown', context));
            },
            saveSession: function (context) {
                return invoke(buildRequestContext('saveSession', context));
            },
            multicall: function (context) {
                return invoke(buildRequestContext('system.multicall', context, context.methods));
            },
            listMethods: function (context) {
                return invoke(buildRequestContext('system.listMethods', context));
            }
        };
    }]);
})();
