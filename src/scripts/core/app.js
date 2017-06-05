(function () {
    'use strict';

    var ariaNg = angular.module('ariaNg', [
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngMessages',
        'ngCookies',
        'ngAnimate',
        'pascalprecht.translate',
        'angularMoment',
        'ngWebSocket',
        'ab-base64',
        'LocalStorageModule',
        'notification',
        'ui-notification',
        'angularBittorrentPeerid',
        'cgBusy',
        'angularPromiseButtons',
        'oitozero.ngSweetAlert',
        angularDragula(angular)
    ])
    .config([
        '$compileProvider',
        function( $compileProvider )
        {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
            // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
        }
    ]);

}());
