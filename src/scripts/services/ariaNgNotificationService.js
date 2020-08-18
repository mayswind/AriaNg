(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgNotificationService', ['$window', 'Notification', 'ariaNgSettingService', function ($window, Notification, ariaNgSettingService) {
        var isSupportBrowserNotification = !!$window.Notification;

        var isBrowserNotifactionGranted = function (permission) {
            return permission === 'granted';
        };

        var getBrowserNotifactionPermission = function () {
            if (!$window.Notification) {
                return null;
            }

            return $window.Notification.permission;
        };

        var requestBrowserNotifactionPermission = function (callback) {
            if (!$window.Notification) {
                return;
            }

            $window.Notification.requestPermission(function (permission) {
                if (callback) {
                    callback({
                        granted: isBrowserNotifactionGranted(permission),
                        permission: permission
                    });
                }
            });
        };

        var showBrowserNotifaction = function (title, options) {
            if (!$window.Notification) {
                return;
            }

            if (!isBrowserNotifactionGranted(getBrowserNotifactionPermission())) {
                return;
            }

            options = angular.extend({
                icon: 'tileicon.png'
            }, options);

            new $window.Notification(title, options);
        };

        return {
            isSupportBrowserNotification: function () {
                return isSupportBrowserNotification;
            },
            hasBrowserPermission: function () {
                if (!isSupportBrowserNotification) {
                    return false;
                }

                return isBrowserNotifactionGranted(getBrowserNotifactionPermission());
            },
            requestBrowserPermission: function (callback) {
                if (!isSupportBrowserNotification) {
                    return;
                }

                requestBrowserNotifactionPermission(function (result) {
                    if (!result.granted) {
                        ariaNgSettingService.setBrowserNotification(false);
                    }

                    if (callback) {
                        callback(result);
                    }
                });
            },
            notifyViaBrowser: function (title, content, options) {
                if (!options) {
                    options = {};
                }

                options.body = content;

                if (isSupportBrowserNotification && ariaNgSettingService.getBrowserNotification()) {
                    showBrowserNotifaction(title, options);
                }
            },
            notifyInPage: function (title, content, options) {
                if (!options) {
                    options = {};
                }

                if (!content) {
                    options.message = title;
                } else {
                    options.title = title;
                    options.message = content;
                }

                if (!options.type || !Notification[options.type]) {
                    options.type = 'primary';
                }

                return Notification[options.type](options);
            },
            clearNotificationInPage: function () {
                Notification.clearAll();
            }
        };
    }]);
}());
