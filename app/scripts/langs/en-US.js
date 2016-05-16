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
            'By File Name': 'By File Name',
            'By File Size': 'By File Size',
            'By Completed Percent': 'By Completed Percent',
            'By Remain Time': 'By Remain Time',
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
