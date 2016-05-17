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
            'File Name': 'File Name',
            'File Size': 'File Size',
            'Completed Percent': 'Percent',
            'Remain Time': 'Remain',
            'Download Speed': 'Download Speed',
            'Files': 'Files',
            'Language': 'Language',
            'Aria2 RPC Host': 'Aria2 RPC Host',
            'Aria2 RPC Port': 'Aria2 RPC Port',
            'Aria2 RPC Protocol': 'Aria2 RPC Protocol',
            'Global Stat Refresh Interval': 'Global Stat Refresh Interval',
            'Download Task Refresh Interval': 'Download Task Refresh Interval',
            'Toggle Navigation': 'Toggle Navigation',
            'Loading': 'Loading...',
            'More Than One Day': 'More than 1 day',
            'Unknown': 'Unknown',
            'Seconds': 'Seconds',
            'Milliseconds': 'Milliseconds',
            '(0 is disabled)': '(0 is disabled)',
            'Changes to the settings take effect after refreshing page.': 'Changes to the settings take effect after refreshing page.'
        });
    }])
})();
