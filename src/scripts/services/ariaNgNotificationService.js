(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgNotificationService', ['$notification', '$translate', 'Notification', 'ariaNgSettingService', function ($notification, $translate, Notification, ariaNgSettingService) {
        var isSupportBrowserNotification = $notification.isSupported;

        var isPermissionGranted = function (permission) {
            return permission === 'granted';
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
            notifyViaBrowser: function (title, content) {
                if (isSupportBrowserNotification && ariaNgSettingService.getBrowserNotification()) {
                    $notification($translate.instant(title), {
                        body: $translate.instant(content)
                    });
                }
            },
            notifyInPage: function (title, content, options) {
                if (!options) {
                    options = {};
                }

                if (title) {
                    title = $translate.instant(title);
                }

                if (content) {
                    content = $translate.instant(content);
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
            notifyTaskComplete: function (task) {
                this.notifyViaBrowser('Download Completed', (task && task.taskName ? task.taskName : ''));
            },
            notifyBtTaskComplete: function (task) {
                this.notifyViaBrowser('BT Download Completed', (task && task.taskName ? task.taskName : ''));
            },
            notifyTaskError: function (task) {
                this.notifyViaBrowser('Download Error', (task && task.taskName ? task.taskName : ''));
            },
            clearNotificationInPage: function () {
                Notification.clearAll();
            }
        };
    }]);
}());
