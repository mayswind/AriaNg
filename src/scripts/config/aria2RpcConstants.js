(function () {
    'use strict';

    angular.module('ariaNg').constant('aria2RpcConstants', {
        rpcServiceVersion: '2.0',
        rpcServiceName: 'aria2',
        rpcSystemServiceName: 'system',
        rpcTokenPrefix: 'token:'
    }).constant('aria2RpcErrors', {
        Unauthorized: {
            message: 'Unauthorized',
            tipTextKey: 'rpc.error.unauthorized'
        }
    });
}());
