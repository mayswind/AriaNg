(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgNotificationService', ['$notification', '$translate', 'ariaNgSettingService', function ($notification, $translate, ariaNgSettingService) {
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
                    $notification($translate.instant(title), {
                        body: $translate.instant(content)
                    });
                }
            },
            notifyTaskComplete: function (task) {
                this.notify('Download Completed', (task && task.taskName ? task.taskName : ''));
            },
            notifyBtTaskComplete: function (task) {
                this.notify('BT Download Completed', (task && task.taskName ? task.taskName : ''));
            },
            notifyTaskError: function (task) {
                this.notify('Download Error', (task && task.taskName ? task.taskName : ''));
            }
        }
    }]);
})();
