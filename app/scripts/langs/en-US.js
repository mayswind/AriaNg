(function () {
    'use strict';

    angular.module('ariaNg').config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('en-US', {
            'New': 'New',
            'Start': 'Start',
            'Pause': 'Pause',
            'Delete': 'Delete',
            'Display Order': 'Display Order',
            'Default': 'Default',
            'File Name': 'File Name',
            'Completed Percent': 'Completed Percent',
            'Remain Time': 'Remain Time',
            'Settings': 'Settings',
            'Download': 'Download',
            'Downloading': 'Downloading',
            'Waiting': 'Waiting',
            'Stopped': 'Stopped',
            'Toggle Navigation': 'Toggle Navigation',
            'Loading': 'Loading...',
            'More Than One Day': 'More than 1 day',
            'Unknown': 'Unknown'
        });
    }])
})();
