(function () {
    'use strict';

    angular.module('ariaNg').constant('ariaNgConstants', {
        title: 'AriaNg',
        appPrefix: 'AriaNg',
        optionStorageKey: 'Options',
        languageStorageKeyPrefix: 'Language',
        languagePath: 'langs',
        languageFileExtension: '.txt',
        defaultLanguage: 'en',
        defaultHost: 'localhost',
        globalStatStorageCapacity: 120,
        taskStatStorageCapacity: 300,
        lazySaveTimeout: 500,
        errorTooltipDelay: 500,
        notificationInPageTimeout: 2000
    }).constant('ariaNgDefaultOptions', {
        language: 'en',
        title: '${downspeed}, ${upspeed} - ${title}',
        titleRefreshInterval: 5000,
        browserNotification: false,
        rpcHost: '',
        rpcPort: '6800',
        protocol: 'http',
        secret: '',
        globalStatRefreshInterval: 1000,
        downloadTaskRefreshInterval: 1000
    });
}());
