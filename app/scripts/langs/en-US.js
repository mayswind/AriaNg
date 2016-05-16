(function () {
    'use strict';

    angular.module('ariaNg').config(['$translateProvider', function ($translateProvider) {
        $translateProvider.translations('en-US', {
            'English': 'English',
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
            'Download': 'Download',
            'Downloading': 'Downloading',
            'Waiting': 'Waiting',
            'Stopped': 'Stopped',
            'Settings': 'Settings',
            'AriaNg Settings': 'AriaNg Settings',
            'Language': 'Language',
            'Aria2 RPC Host': 'Aria2 RPC Host',
            'Aria2 RPC Protocol': 'Aria2 RPC Protocol',
            'Toggle Navigation': 'Toggle Navigation',
            'Loading': 'Loading...',
            'More Than One Day': 'More than 1 day',
            'Unknown': 'Unknown',
            'Changes to the settings take effect after refreshing page.': 'Changes to the settings take effect after refreshing page.'
        });
    }])
})();
