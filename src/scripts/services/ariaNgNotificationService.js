(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgNotificationService', ['$window', 'Notification', 'ariaNgConstants', 'ariaNgCommonService', 'ariaNgStorageService', 'ariaNgLocalizationService', 'ariaNgLogService', 'ariaNgSettingService', function ($window, Notification, ariaNgConstants, ariaNgCommonService, ariaNgStorageService, ariaNgLocalizationService, ariaNgLogService, ariaNgSettingService) {
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

        var isReachBrowserNotificationFrequencyLimit = function () {
            if (!ariaNgSettingService.getBrowserNotificationFrequency() || ariaNgSettingService.getBrowserNotificationFrequency() === 'unlimited') {
                return false;
            }

            var lastNotifications = ariaNgStorageService.get(ariaNgConstants.browserNotificationHistoryStorageKey) || [];

            if (!angular.isArray(lastNotifications)) {
                return false;
            }

            if (lastNotifications.length < 1) {
                return false;
            }

            var oldestTime = null;
            var isReachLimit = false;

            if (ariaNgSettingService.getBrowserNotificationFrequency() === 'high') {
                if (lastNotifications.length < 10) {
                    return false;
                }

                oldestTime = lastNotifications[lastNotifications.length - 10].time;
                isReachLimit = ariaNgCommonService.isUnixTimeAfter(oldestTime, '-1', 'minute');
            } else if (ariaNgSettingService.getBrowserNotificationFrequency() === 'middle') {
                oldestTime = lastNotifications[lastNotifications.length - 1].time;
                isReachLimit = ariaNgCommonService.isUnixTimeAfter(oldestTime, '-1', 'minute');
            } else if (ariaNgSettingService.getBrowserNotificationFrequency() === 'low') {
                oldestTime = lastNotifications[lastNotifications.length - 1].time;
                isReachLimit = ariaNgCommonService.isUnixTimeAfter(oldestTime, '-5', 'minute');
            }

            if (isReachLimit) {
                ariaNgLogService.debug('[ariaNgNotificationService.isReachBrowserNotificationFrequencyLimit] reach frequency limit'
                    + (oldestTime ? ', the oldest time is ' + oldestTime : ''));
            }

            return isReachLimit;
        };

        var recordBrowserNotificationHistory = function () {
            if (!ariaNgSettingService.getBrowserNotificationFrequency() || ariaNgSettingService.getBrowserNotificationFrequency() === 'unlimited') {
                return;
            }

            var lastNotifications = ariaNgStorageService.get(ariaNgConstants.browserNotificationHistoryStorageKey) || [];

            if (!angular.isArray(lastNotifications)) {
                lastNotifications = [];
            }

            lastNotifications.push({
                time: ariaNgCommonService.getCurrentUnixTime()
            });

            if (lastNotifications.length > 10) {
                lastNotifications.splice(0, lastNotifications.length - 10);
            }

            ariaNgStorageService.set(ariaNgConstants.browserNotificationHistoryStorageKey, lastNotifications);
        };

        var showBrowserNotifaction = function (title, options) {
            if (!$window.Notification) {
                return;
            }

            if (!isBrowserNotifactionGranted(getBrowserNotifactionPermission())) {
                return;
            }

            if (isReachBrowserNotificationFrequencyLimit()) {
                return;
            }

            options = angular.extend({
                icon: 'tileicon.png'
            }, options);

            recordBrowserNotificationHistory();

            new $window.Notification(title, options);
        };

        var notifyViaBrowser = function (title, content, options) {
            if (!options) {
                options = {};
            }

            options.body = content;

            if (!ariaNgSettingService.getBrowserNotificationSound()) {
                options.silent = true;
            }

            if (isSupportBrowserNotification && ariaNgSettingService.getBrowserNotification()) {
                showBrowserNotifaction(title, options);
            }
        };

        var notifyInPage = function (title, content, options) {
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

            if (!options.positionY) {
                options.positionY = 'top';
            }

            return Notification[options.type](options);
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

                if (title) {
                    title = ariaNgLocalizationService.getLocalizedText(title, options.titleParams);
                }

                if (content) {
                    content = ariaNgLocalizationService.getLocalizedText(content, options.contentParams);
                }

                return notifyViaBrowser(title, content, options);
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
            notifyInPage: function (title, content, options) {
                if (!options) {
                    options = {};
                }

                if (title) {
                    title = ariaNgLocalizationService.getLocalizedText(title, options.titleParams);
                }

                if (content) {
                    content = ariaNgLocalizationService.getLocalizedText(content, options.contentParams);

                    if (options.contentPrefix) {
                        content = options.contentPrefix + content;
                    }
                }

                return notifyInPage(title, content, options);
            },
            clearNotificationInPage: function () {
                Notification.clearAll();
            }
        };
    }]);
}());
