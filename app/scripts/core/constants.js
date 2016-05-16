(function () {
    'use strict';

    angular.module('ariaNg').constant('ariaNgConstants', {
        title: 'Aria Ng',
        appPrefix: 'AriaNg',
        optionStorageKey: 'Options'
    }).constant('ariaNgDefaultOptions', {
        language: 'en-US',
        rpcHost: '',
        rpcPort: '6800',
        protocol: 'http',
        globalStatRefreshInterval: 1000,
        downloadTaskRefreshInterval: 1000
    }).constant('aria2RpcConstants', {
        rpcServiceVersion: '2.0',
        rpcServiceName: 'aria2'
    });
})();
