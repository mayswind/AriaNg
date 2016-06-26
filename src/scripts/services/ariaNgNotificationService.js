(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgNotificationService', ['$notification', 'ariaNgSettingService', function ($notification, ariaNgSettingService) {
        var isSupportBrowserNotification = $notification.isSupported;

        var isPermissionGranted = function (permission) {
            return permission == 'granted';
        };

        return {
            isSupportBrowserNotification: function () {
                return isSupportBrowserNotification;
            },
            isPermissionGranted: function (permission) {
                return isPermissionGranted(permission);
            },
            hasBrowserPermission: function () {
                if (!isSupportBrowserNotification) {
                    return false;
                }

                return isPermissionGranted($notification.getPermission());
            },
            requestBrowserPermission: function (callback) {
                if (!isSupportBrowserNotification) {
                    return;
                }

                $notification.requestPermission().then(function (permission) {
                    if (!isPermissionGranted(permission)) {
                        ariaNgSettingService.setBrowserNotification(false);
                    }

                    if (callback) {
                        callback(permission);
                    }
                });
            },
            notify: function (title, content) {
                if (isSupportBrowserNotification && ariaNgSettingService.getBrowserNotification()) {
                    $notification(title, {
                        body: content
                    });
                }
            }
        }
    }]);
})();
