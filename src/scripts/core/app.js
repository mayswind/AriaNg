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
    ]);
}());
