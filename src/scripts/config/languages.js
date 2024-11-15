(function () {
    'use strict';

    angular.module('ariaNg').constant('ariaNgLanguages', {
        'en': {
            name: 'English',
            displayName: 'English'
        },
        'zh_Hans': {
            name: 'Simplified Chinese',
            displayName: '简体中文',
            aliases: ['zh_CHS', 'zh_CN', 'zh_SG']
        },
        'zh_Hant': {
            name: 'Traditional Chinese',
            displayName: '繁體中文',
            aliases: ['zh_CHT', 'zh_TW', 'zh_HK', 'zh_MO']
        },
        'it_IT': {
            name: 'Italian',
            displayName: 'Italiano'
        },
        'fr_FR': {
            name: 'French',
            displayName: 'Français'
        }
    });
}());
