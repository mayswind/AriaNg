(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgTitleService', ['$filter', 'ariaNgConstants', 'ariaNgLocalizationService', 'ariaNgSettingService', function ($filter, ariaNgConstants, ariaNgLocalizationService, ariaNgSettingService) {
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

        var replaceCurrentRPCAlias = function (title, value) {
            return replacePlaceholders(title, 'rpcprofile', {
                value: value
            });
        };

        var replaceDownloadingCount = function (title, value) {
            return replacePlaceholders(title, 'downloading', {
                prefix: ariaNgLocalizationService.getLocalizedText('Downloading') + ': ',
                value: value
            });
        };

        var replaceWaitingCount = function (title, value) {
            return replacePlaceholders(title, 'waiting', {
                prefix: ariaNgLocalizationService.getLocalizedText('Waiting') + ': ',
                value: value
            });
        };

        var replaceStoppedCount = function (title, value) {
            return replacePlaceholders(title, 'stopped', {
                prefix: ariaNgLocalizationService.getLocalizedText('Finished / Stopped') + ': ',
                value: value
            });
        };

        var replaceDownloadSpeed = function (title, value) {
            return replacePlaceholders(title, 'downspeed', {
                prefix: ariaNgLocalizationService.getLocalizedText('Download') + ': ',
                value: value,
                type: 'volume',
                suffix: '/s'
            });
        };

        var replaceUploadSpeed = function (title, value) {
            return replacePlaceholders(title, 'upspeed', {
                prefix: ariaNgLocalizationService.getLocalizedText('Upload') + ': ',
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

                title = replaceCurrentRPCAlias(title, context.currentRPCAlias);
                title = replaceDownloadingCount(title, context.downloadingCount);
                title = replaceWaitingCount(title, context.waitingCount);
                title = replaceStoppedCount(title, context.stoppedCount);
                title = replaceDownloadSpeed(title, context.downloadSpeed);
                title = replaceUploadSpeed(title, context.uploadSpeed);
                title = replaceAgiaNgTitle(title);

                return title;
            },
            getFinalTitleByGlobalStat: function (params) {
                var context = {
                    currentRPCAlias: (params && params.currentRpcProfile ? (params.currentRpcProfile.rpcAlias || (params.currentRpcProfile.rpcHost + ':' + params.currentRpcProfile.rpcPort)) : ''),
                    downloadingCount: (params && params.globalStat ? params.globalStat.numActive : 0),
                    waitingCount: (params && params.globalStat ? params.globalStat.numWaiting : 0),
                    stoppedCount: (params && params.globalStat ? params.globalStat.numStopped : 0),
                    downloadSpeed: (params && params.globalStat ? params.globalStat.downloadSpeed : 0),
                    uploadSpeed: (params && params.globalStat ? params.globalStat.uploadSpeed : 0)
                };

                return this.getFinalTitle(context);
            }
        };
    }]);
}());
