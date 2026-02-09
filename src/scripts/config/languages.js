(function () {
    'use strict';

    angular.module('ariaNg').constant('ariaNgLanguages', {
        'cz_CZ': {
            name: 'Czech',
            displayName: 'Čeština'
        },
        'de_DE': {
            name: 'German',
            displayName: 'Deutsch'
        },
        'en': {
            name: 'English',
            displayName: 'English'
        },
        'es': {
            name: 'Spanish',
            displayName: 'Español'
        },
        'fr_FR': {
            name: 'French',
            displayName: 'Français'
        },
        'it_IT': {
            name: 'Italian',
            displayName: 'Italiano'
        },
        'ja_JP': {
            name: 'Japanese',
            displayName: '日本語'
        },
        'pl_PL': {
            name: 'Polish',
            displayName: 'Polski'
        },
        'ru_RU': {
            name: 'Russian',
            displayName: 'Русский'
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
        }
    });
}());
