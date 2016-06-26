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
                            data: result,
                            context: invokeContext
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
                            errorProcessed: errorProcessed,
                            context: invokeContext
                        });
                    }
                };
            }

            if (arguments.length > 2) {
                for (var i = 2; i < arguments.length; i++) {
                    if (arguments[i] != null && angular.isDefined(arguments[i])) {
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
                var urls = context.task.urls;
                var options = angular.copy(context.task.options);

                if (context.pauseOnAdded) {
                    options.pause = 'true';
                }

                return invoke(buildRequestContext('addUri', context, urls, options));
            },
            addUriMulti: function (context) {
                var contexts = [];

                for (var i = 0; i < context.tasks.length; i++) {
                    var task = context.tasks[i];

                    contexts.push({
                        silent: !!context.silent,
                        task: task,
                        pauseOnAdded: context.pauseOnAdded
                    });
                }

                return invokeMulti(this.addUri, contexts, context.callback);
            },
            addTorrent: function (context) {
                var content = context.task.content;
                var options = angular.copy(context.task.options);

                if (context.pauseOnAdded) {
                    options.pause = 'true';
                }

                return invoke(buildRequestContext('addTorrent', context, content, [], options));
            },
            addMetalink: function (context) {
                var content = context.task.content;
                var options = angular.copy(context.task.options);

                if (context.pauseOnAdded) {
                    options.pause = 'true';
                }

                return invoke(buildRequestContext('addMetalink', context, content, [], options));
            },
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
                    angular.isDefined(context.requestParams) ? context.requestParams: null
                ));
            },
            tellWaiting: function (context) {
                return invoke(buildRequestContext('tellWaiting', context,
                    angular.isDefined(context.offset) ? context.offset : 0,
                    angular.isDefined(context.num) ? context.num : 1000,
                    angular.isDefined(context.requestParams) ? context.requestParams : null
                ));
            },
            tellStopped: function (context) {
                return invoke(buildRequestContext('tellStopped', context,
                    angular.isDefined(context.offset) ? context.offset : 0,
                    angular.isDefined(context.num) ? context.num : 1000,
                    angular.isDefined(context.requestParams) ? context.requestParams: null
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
