(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2RpcService', ['aria2RpcConstants', 'aria2WebSocketRpcService', 'utils', function (aria2RpcConstants, aria2WebSocketRpcService, utils) {
        var invoke = function (method, context) {
            context.uniqueId = utils.generateUniqueId();
            context.requestBody = {
                jsonrpc: aria2RpcConstants.rpcServiceVersion,
                method: aria2RpcConstants.rpcServiceName + '.' + method,
                id: context.uniqueId,
                params: context.params
            };

            return aria2WebSocketRpcService.request(context);
        };

        return {
            addUri: function (context) {
                return invoke('addUri', context);
            },
            addTorrent: function (context) {
                return invoke('addTorrent', context);
            },
            addMetalink: function (context) {
                return invoke('addMetalink', context);
            },
            remove: function (context) {
                return invoke('remove', context);
            },
            forceRemove: function (context) {
                return invoke('forceRemove', context);
            },
            pause: function (context) {
                return invoke('pause', context);
            },
            pauseAll: function (context) {
                return invoke('pauseAll', context);
            },
            forcePause: function (context) {
                return invoke('forcePause', context);
            },
            forcePauseAll: function (context) {
                return invoke('forcePauseAll', context);
            },
            unpause: function (context) {
                return invoke('unpause', context);
            },
            unpauseAll: function (context) {
                return invoke('unpauseAll', context);
            },
            tellStatus: function (context) {
                return invoke('tellStatus', context);
            },
            getUris: function (context) {
                return invoke('getUris', context);
            },
            getFiles: function (context) {
                return invoke('getFiles', context);
            },
            getPeers: function (context) {
                return invoke('getPeers', context);
            },
            getServers: function (context) {
                return invoke('getServers', context);
            },
            tellActive: function (context) {
                return invoke('tellActive', context);
            },
            tellWaiting: function (context) {
                return invoke('tellWaiting', context);
            },
            tellStopped: function (context) {
                return invoke('tellStopped', context);
            },
            changePosition: function (context) {
                return invoke('changePosition', context);
            },
            changeUri: function (context) {
                return invoke('changeUri', context);
            },
            getOption: function (context) {
                return invoke('getOption', context);
            },
            changeOption: function (context) {
                return invoke('changeOption', context);
            },
            getGlobalOption: function (context) {
                return invoke('getGlobalOption', context);
            },
            changeGlobalOption: function (context) {
                return invoke('changeGlobalOption', context);
            },
            getGlobalStat: function (context) {
                return invoke('getGlobalStat', context);
            },
            purgeDownloadResult: function (context) {
                return invoke('purgeDownloadResult', context);
            },
            removeDownloadResult: function (context) {
                return invoke('removeDownloadResult', context);
            },
            getVersion: function (context) {
                return invoke('getVersion', context);
            },
            getSessionInfo: function (context) {
                return invoke('getSessionInfo', context);
            },
            shutdown: function (context) {
                return invoke('shutdown', context);
            },
            forceShutdown: function (context) {
                return invoke('forceShutdown', context);
            },
            saveSession: function (context) {
                return invoke('saveSession', context);
            },
            multicall: function (context) {
                return invoke('multicall', context);
            },
            listMethods: function (context) {
                return invoke('listMethods', context);
            }
        };
    }]);
})();
