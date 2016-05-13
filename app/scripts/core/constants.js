(function () {
    'use strict';

    angular.module('ariaNg').constant('ariaNgConstants', {
        title: 'Aria Ng',
        appPrefix: 'AriaNg'
    }).constant('ariaNgDefaultOptions', {
        localeName: 'en-US',
        globalStatRefreshInterval: 1000,
        downloadTaskRefreshInterval: 1000
    }).constant('aria2RpcConstants', {
        rpcServiceVersion: '2.0',
        rpcServiceName: 'aria2'
    });
})();
