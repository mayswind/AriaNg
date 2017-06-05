(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2RpcService', ['$q', 'aria2RpcConstants', 'aria2RpcErrors', 'ariaNgCommonService', 'ariaNgSettingService', 'ariaNgLogService', 'aria2HttpRpcService', 'aria2WebSocketRpcService', function ($q, aria2RpcConstants, aria2RpcErrors, ariaNgCommonService, ariaNgSettingService, ariaNgLogService, aria2HttpRpcService, aria2WebSocketRpcService) {
        var rpcImplementService = ariaNgSettingService.isCurrentRpcUseWebSocket() ? aria2WebSocketRpcService : aria2HttpRpcService;
        var isConnected = false;
        var secret = ariaNgSettingService.getCurrentRpcSecret();

        var onFirstSuccessCallbacks = [];
        var onConnectSuccessCallbacks = [];
        var onConnectErrorCallbacks = [];
        var onDownloadStartCallbacks = [];
        var onDownloadPauseCallbacks = [];
        var onDownloadStopCallbacks = [];
        var onDownloadCompleteCallbacks = [];
        var onDownloadErrorCallbacks = [];
        var onBtDownloadCompleteCallbacks = [];

        var checkIsSystemMethod = function (methodName) {
            return methodName.indexOf(aria2RpcConstants.rpcSystemServiceName + '.') === 0;
        };

        var getAria2MethodFullName = function (methodName) {
            return aria2RpcConstants.rpcServiceName + '.' + methodName;
        };

        var getAria2EventFullName = function (eventName) {
            return getAria2MethodFullName(eventName);
        };

        var invoke = function (requestContext, returnContextOnly) {
            if (returnContextOnly) {
                return requestContext;
            }

            var uniqueId = ariaNgCommonService.generateUniqueId();

            var requestBody = {
                jsonrpc: aria2RpcConstants.rpcServiceVersion,
                method: requestContext.methodName,
                id: uniqueId,
                params: requestContext.params
            };

            var invokeContext = {
                uniqueId: uniqueId,
                requestBody: requestBody,
                successCallback: requestContext.successCallback,
                errorCallback: requestContext.errorCallback
            };

            return rpcImplementService.request(invokeContext);
        };

        var registerEvent = function (eventName, callbacks) {
            var fullEventName = getAria2EventFullName(eventName);

            rpcImplementService.on(fullEventName, function (context) {
                if (!angular.isArray(callbacks) || callbacks.length < 1) {
                    return;
                }

                for (var i = 0; i < callbacks.length; i++) {
                    var callback = callbacks[i];
                    callback(context);
                }
            });
        };

        var fireCustomEvent = function (callbacks) {
            if (!angular.isArray(callbacks) || callbacks.length < 1) {
                return;
            }

            for (var i = 0; i < callbacks.length; i++) {
                var callback = callbacks[i];
                callback();
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

            ariaNgLogService.error('[aria2RpcService.processError] ' + error.message, error);

            if (aria2RpcErrors[error.message] && aria2RpcErrors[error.message].tipTextKey) {
                ariaNgCommonService.showError(aria2RpcErrors[error.message].tipTextKey);
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
                var innerContext = arguments[1];

                context.successCallback = function (id, result) {
                    if (innerContext.callback) {
                        innerContext.callback({
                            id: id,
                            success: true,
                            data: result,
                            context: innerContext
                        });
                    }

                    fireCustomEvent(onConnectSuccessCallbacks);

                    if (!isConnected) {
                        isConnected = true;
                        fireCustomEvent(onFirstSuccessCallbacks);
                    }
                };

                context.errorCallback = function (id, error) {
                    var errorProcessed = false;

                    if (!innerContext.silent) {
                        errorProcessed = processError(error);
                    }

                    if (innerContext.callback) {
                        innerContext.callback({
                            id: id,
                            success: false,
                            data: error,
                            errorProcessed: errorProcessed,
                            context: innerContext
                        });
                    }

                    fireCustomEvent(onConnectErrorCallbacks);
                };
            }

            if (arguments.length > 2) {
                for (var i = 2; i < arguments.length; i++) {
                    if (arguments[i] !== null && angular.isDefined(arguments[i])) {
                        finalParams.push(arguments[i]);
                    }
                }
            }

            if (finalParams.length > 0) {
                context.params = finalParams;
            }

            return context;
        };

        (function () {
            registerEvent('onDownloadStart', onDownloadStartCallbacks);
            registerEvent('onDownloadPause', onDownloadPauseCallbacks);
            registerEvent('onDownloadStop', onDownloadStopCallbacks);
            registerEvent('onDownloadComplete', onDownloadCompleteCallbacks);
            registerEvent('onDownloadError', onDownloadErrorCallbacks);
            registerEvent('onBtDownloadComplete', onBtDownloadCompleteCallbacks);
        })();

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
                    'status',
                    'errorCode'
                ];
            },
            getFullTaskParams: function () {
                var requestParams = this.getBasicTaskParams();

                requestParams.push('files');
                requestParams.push('bittorrent');

                return requestParams;
            },
            addUri: function (context, returnContextOnly) {
                var urls = context.task.urls;
                var options = angular.copy(context.task.options);

                if (context.pauseOnAdded) {
                    options.pause = 'true';
                }

                return invoke(buildRequestContext('addUri', context, urls, options), !!returnContextOnly);
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
            addTorrent: function (context, returnContextOnly) {
                var content = context.task.content;
                var options = angular.copy(context.task.options);

                if (context.pauseOnAdded) {
                    options.pause = 'true';
                }

                return invoke(buildRequestContext('addTorrent', context, content, [], options), !!returnContextOnly);
            },
            addMetalink: function (context, returnContextOnly) {
                var content = context.task.content;
                var options = angular.copy(context.task.options);

                if (context.pauseOnAdded) {
                    options.pause = 'true';
                }

                return invoke(buildRequestContext('addMetalink', context, content, [], options), !!returnContextOnly);
            },
            remove: function (context, returnContextOnly) {
                return invoke(buildRequestContext('remove', context, context.gid), !!returnContextOnly);
            },
            forceRemove: function (context, returnContextOnly) {
                return invoke(buildRequestContext('forceRemove', context, context.gid), !!returnContextOnly);
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
            pause: function (context, returnContextOnly) {
                return invoke(buildRequestContext('pause', context, context.gid), !!returnContextOnly);
            },
            pauseAll: function (context, returnContextOnly) {
                return invoke(buildRequestContext('pauseAll', context), !!returnContextOnly);
            },
            forcePause: function (context, returnContextOnly) {
                return invoke(buildRequestContext('forcePause', context, context.gid), !!returnContextOnly);
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
            forcePauseAll: function (context, returnContextOnly) {
                return invoke(buildRequestContext('forcePauseAll', context), !!returnContextOnly);
            },
            unpause: function (context, returnContextOnly) {
                return invoke(buildRequestContext('unpause', context, context.gid), !!returnContextOnly);
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
            unpauseAll: function (context, returnContextOnly) {
                return invoke(buildRequestContext('unpauseAll', context), !!returnContextOnly);
            },
            tellStatus: function (context, returnContextOnly) {
                return invoke(buildRequestContext('tellStatus', context, context.gid), !!returnContextOnly);
            },
            getUris: function (context, returnContextOnly) {
                return invoke(buildRequestContext('getUris', context, context.gid), !!returnContextOnly);
            },
            getFiles: function (context, returnContextOnly) {
                return invoke(buildRequestContext('getFiles', context, context.gid), !!returnContextOnly);
            },
            getPeers: function (context, returnContextOnly) {
                return invoke(buildRequestContext('getPeers', context, context.gid), !!returnContextOnly);
            },
            getServers: function (context, returnContextOnly) {
                return invoke(buildRequestContext('getServers', context, context.gid), !!returnContextOnly);
            },
            tellActive: function (context, returnContextOnly) {
                return invoke(buildRequestContext('tellActive', context,
                    angular.isDefined(context.requestParams) ? context.requestParams: null
                ), !!returnContextOnly);
            },
            tellWaiting: function (context, returnContextOnly) {
                return invoke(buildRequestContext('tellWaiting', context,
                    angular.isDefined(context.offset) ? context.offset : 0,
                    angular.isDefined(context.num) ? context.num : 1000,
                    angular.isDefined(context.requestParams) ? context.requestParams : null
                ), !!returnContextOnly);
            },
            tellStopped: function (context, returnContextOnly) {
                return invoke(buildRequestContext('tellStopped', context,
                    angular.isDefined(context.offset) ? context.offset : -1,
                    angular.isDefined(context.num) ? context.num : 1000,
                    angular.isDefined(context.requestParams) ? context.requestParams: null
                ), !!returnContextOnly);
            },
            changePosition: function (context, returnContextOnly) {
                return invoke(buildRequestContext('changePosition', context, context.gid, context.pos, context.how), !!returnContextOnly);
            },
            changeUri: function (context, returnContextOnly) {
                return invoke(buildRequestContext('changeUri', context, context.gid, context.fileIndex, context.delUris, context.addUris), !!returnContextOnly);
            },
            getOption: function (context, returnContextOnly) {
                return invoke(buildRequestContext('getOption', context, context.gid), !!returnContextOnly);
            },
            changeOption: function (context, returnContextOnly) {
                return invoke(buildRequestContext('changeOption', context, context.gid, context.options), !!returnContextOnly);
            },
            getGlobalOption: function (context, returnContextOnly) {
                return invoke(buildRequestContext('getGlobalOption', context), !!returnContextOnly);
            },
            changeGlobalOption: function (context, returnContextOnly) {
                return invoke(buildRequestContext('changeGlobalOption', context, context.options), !!returnContextOnly);
            },
            getGlobalStat: function (context, returnContextOnly) {
                return invoke(buildRequestContext('getGlobalStat', context), !!returnContextOnly);
            },
            purgeDownloadResult: function (context, returnContextOnly) {
                return invoke(buildRequestContext('purgeDownloadResult', context), !!returnContextOnly);
            },
            removeDownloadResult: function (context, returnContextOnly) {
                return invoke(buildRequestContext('removeDownloadResult', context, context.gid), !!returnContextOnly);
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
            getVersion: function (context, returnContextOnly) {
                return invoke(buildRequestContext('getVersion', context), !!returnContextOnly);
            },
            getSessionInfo: function (context, returnContextOnly) {
                return invoke(buildRequestContext('getSessionInfo', context), !!returnContextOnly);
            },
            shutdown: function (context, returnContextOnly) {
                return invoke(buildRequestContext('shutdown', context), !!returnContextOnly);
            },
            forceShutdown: function (context, returnContextOnly) {
                return invoke(buildRequestContext('forceShutdown', context), !!returnContextOnly);
            },
            saveSession: function (context, returnContextOnly) {
                return invoke(buildRequestContext('saveSession', context), !!returnContextOnly);
            },
            multicall: function (context) {
                return invoke(buildRequestContext('system.multicall', context, context.methods));
            },
            listMethods: function (context) {
                return invoke(buildRequestContext('system.listMethods', context));
            },
            onFirstSuccess: function (context) {
                onFirstSuccessCallbacks.push(context.callback);
            },
            onConnectSuccess: function (context) {
                onConnectSuccessCallbacks.push(context.callback);
            },
            onConnectError: function (context) {
                onConnectErrorCallbacks.push(context.callback);
            },
            onDownloadStart: function (context) {
                onDownloadStartCallbacks.push(context.callback);
            },
            onDownloadPause: function (context) {
                onDownloadPauseCallbacks.push(context.callback);
            },
            onDownloadStop: function (context) {
                onDownloadStopCallbacks.push(context.callback);
            },
            onDownloadComplete: function (context) {
                onDownloadCompleteCallbacks.push(context.callback);
            },
            onDownloadError: function (context) {
                onDownloadErrorCallbacks.push(context.callback);
            },
            onBtDownloadComplete: function (context) {
                onBtDownloadCompleteCallbacks.push(context.callback);
            }
        };
    }]);
}());
