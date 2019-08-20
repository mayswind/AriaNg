(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgLocalizationService', ['$translate', 'amMoment', 'ariaNgCommonService', 'ariaNgNotificationService', function ($translate, amMoment, ariaNgCommonService, ariaNgNotificationService) {
        return {
            applyLanguage: function (lang) {
                $translate.use(lang);
                amMoment.changeLocale(lang);

                return true;
            },
            getLocalizedText: function (text, params) {
                return $translate.instant(text, params);
            },
            getLongDateFormat: function () {
                return this.getLocalizedText('format.longdate');
            },
            showDialog: function (title, text, type, callback, extendSettings) {
                if (!extendSettings) {
                    extendSettings = {};
                }

                if (title) {
                    title = this.getLocalizedText(title);
                }

                if (text) {
                    text = this.getLocalizedText(text, extendSettings.textParams);
                }

                extendSettings.confirmButtonText = this.getLocalizedText('OK');

                ariaNgCommonService.showDialog(title, text, type, callback, extendSettings);
            },
            showInfo: function (title, text, callback, extendSettings) {
                this.showDialog(title, text, 'info', callback, extendSettings);
            },
            showError: function (text, callback) {
                this.showDialog('Error', text, 'error', callback);
            },
            showOperationSucceeded: function (text, callback) {
                this.showDialog('Operation Succeeded', text, 'success', callback);
            },
            confirm: function (title, text, type, callback, notClose, extendSettings) {
                if (!extendSettings) {
                    extendSettings = {};
                }

                if (title) {
                    title = this.getLocalizedText(title);
                }

                if (text) {
                    text = this.getLocalizedText(text, extendSettings.textParams);
                }

                extendSettings.confirmButtonText = this.getLocalizedText('OK');
                extendSettings.cancelButtonText = this.getLocalizedText('Cancel');

                ariaNgCommonService.confirm(title, text, type, callback, notClose, extendSettings);
            },
            notifyViaBrowser: function (title, content, options) {
                if (title) {
                    title = this.getLocalizedText(title);
                }

                if (content) {
                    content = this.getLocalizedText(content);
                }

                return ariaNgNotificationService.notifyViaBrowser(title, content, options);
            },
            notifyInPage: function (title, content, options) {
                if (!options) {
                    options = {};
                }

                if (title) {
                    title = this.getLocalizedText(title, options.titleParams);
                }

                if (content) {
                    content = this.getLocalizedText(content, options.contentParams);

                    if (options.contentPrefix) {
                        content = options.contentPrefix + content;
                    }
                }

                return ariaNgNotificationService.notifyInPage(title, content, options);
            },
            notifyTaskComplete: function (task) {
                this.notifyViaBrowser('Download Completed', (task && task.taskName ? task.taskName : ''));
            },
            notifyBtTaskComplete: function (task) {
                this.notifyViaBrowser('BT Download Completed', (task && task.taskName ? task.taskName : ''));
            },
            notifyTaskError: function (task) {
                this.notifyViaBrowser('Download Error', (task && task.taskName ? task.taskName : ''));
            }
        };
    }]);
}());
