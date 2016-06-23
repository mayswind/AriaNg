(function () {
    'use strict';

    angular.module('ariaNg').constant('ariaNgConstants', {
        title: 'Aria Ng',
        appPrefix: 'AriaNg',
        optionStorageKey: 'Options',
        globalStatStorageCapacity: 120,
        taskStatStorageCapacity: 300,
        lazySaveTimeout: 500
    }).constant('ariaNgDefaultOptions', {
        language: 'en',
        rpcHost: '',
        rpcPort: '6800',
        protocol: 'http',
        secret: '',
        globalStatRefreshInterval: 1000,
        downloadTaskRefreshInterval: 1000
    });
})();
