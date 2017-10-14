(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgTitleService', ['$filter', '$translate', 'ariaNgConstants', 'ariaNgSettingService', function ($filter, $translate, ariaNgConstants, ariaNgSettingService) {
        var parseSettings = function (placeholder) {
            if (!placeholder) {
                return {};
            }

            var innerText = placeholder.substring(2, placeholder.length - 1); // remove ${ and }
            var items = innerText.split(':');

            var settings = {
                oldValue: placeholder
            };

            for (var i = 1; i < items.length; i++) {
                var pairs = items[i].split('=');

                if (pairs.length === 1) {
                    settings[pairs[0]] = true;
                } else if (pairs.length === 2) {
                    settings[pairs[0]] = pairs[1];
                }
            }

            return settings;
        };

        var replacePlaceholder = function (title, context) {
            var value = context.value;

            if (context.type === 'volume') {
                value = $filter('readableVolume')(value, context.scale);
            }

            if (context.prefix && !context.noprefix) {
                value = context.prefix + value;
            }

            if (context.suffix && !context.nosuffix) {
                value = value + context.suffix;
            }

            return title.replace(context.oldValue, value);
        };

        var replacePlaceholders = function (title, condition, context) {
            var regex = new RegExp('\\$\\{' + condition + '(:[a-zA-Z0-9]+(=[a-zA-Z0-9]+)?)*\\}', 'g');
            var results = title.match(regex);

            if (results && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    var innerContext = parseSettings(results[i]);
                    angular.extend(innerContext, context);

                    title = replacePlaceholder(title, innerContext);
                }
            }

            return title;
        };

        var replaceDownloadingCount = function (title, value) {
            return replacePlaceholders(title, 'downloading', {
                prefix: $translate.instant('Downloading') + ': ',
                value: value
            });
        };

        var replaceWaitingCount = function (title, value) {
            return replacePlaceholders(title, 'waiting', {
                prefix: $translate.instant('Waiting') + ': ',
                value: value
            });
        };

        var replaceStoppedCount = function (title, value) {
            return replacePlaceholders(title, 'stopped', {
                prefix: $translate.instant('Finished / Stopped'),
                value: value
            });
        };

        var replaceDownloadSpeed = function (title, value) {
            return replacePlaceholders(title, 'downspeed', {
                prefix: $translate.instant('Download') + ': ',
                value: value,
                type: 'volume',
                suffix: '/s'
            });
        };

        var replaceUploadSpeed = function (title, value) {
            return replacePlaceholders(title, 'upspeed', {
                prefix: $translate.instant('Upload') + ': ',
                value: value,
                type: 'volume',
                suffix: '/s'
            });
        };

        var replaceAgiaNgTitle = function (title) {
            return replacePlaceholders(title, 'title', {
                value: ariaNgConstants.title
            });
        };

        return {
            getFinalTitle: function (context) {
                var title = ariaNgSettingService.getTitle();

                context = angular.extend({
                    downloadingCount: 0,
                    waitingCount: 0,
                    stoppedCount: 0,
                    downloadSpeed: 0,
                    uploadSpeed: 0
                }, context);

                title = replaceDownloadingCount(title, context.downloadingCount);
                title = replaceWaitingCount(title, context.waitingCount);
                title = replaceStoppedCount(title, context.stoppedCount);
                title = replaceDownloadSpeed(title, context.downloadSpeed);
                title = replaceUploadSpeed(title, context.uploadSpeed);
                title = replaceAgiaNgTitle(title);

                return title;
            },
            getFinalTitleByGlobalStat: function (globalStat) {
                var context = {
                    downloadingCount: (globalStat ? globalStat.numActive : 0),
                    waitingCount: (globalStat ? globalStat.numWaiting : 0),
                    stoppedCount: (globalStat ? globalStat.numStopped : 0),
                    downloadSpeed: (globalStat ? globalStat.downloadSpeed : 0),
                    uploadSpeed: (globalStat ? globalStat.uploadSpeed : 0)
                };

                return this.getFinalTitle(context);
            }
        };
    }]);
}());
