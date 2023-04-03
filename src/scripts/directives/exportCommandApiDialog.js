(function () {
    'use strict';

    angular.module('ariaNg').directive('ngExportCommandApiDialog', ['clipboard', 'ariaNgCommonService', function (clipboard, ariaNgCommonService) {
        return {
            restrict: 'E',
            templateUrl: 'views/export-command-api-dialog.html',
            replace: true,
            scope: {
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.context = {
                    trueFalseOptions: [{name: 'Enabled', value: true}, {name: 'Disabled', value: false}],
                    baseUrl: ariaNgCommonService.getFullPageUrl(),
                    commandAPIUrl: null,
                    pauseOnAdded: true,
                    isCopied: false
                };

                var getBaseUrl = function () {
                    var baseUrl = scope.context.baseUrl;

                    if (baseUrl.indexOf('#') >= 0) {
                        baseUrl = baseUrl.substring(0, baseUrl.indexOf('#'));
                    }

                    return baseUrl;
                };

                var getNewTaskCommandAPIUrl = function (task) {
                    var commandAPIUrl = getBaseUrl() + '#!/new/task?' +
                        'url=' + ariaNgCommonService.base64UrlEncode(task.urls[0]);

                    if (scope.context.pauseOnAdded) {
                        commandAPIUrl += '&pause=true';
                    }

                    if (task.options) {
                        for (var key in task.options) {
                            if (!task.options.hasOwnProperty(key)) {
                                continue;
                            }

                            commandAPIUrl += '&' + key + '=' + task.options[key];
                        }
                    }

                    return commandAPIUrl;
                };

                var getNewTasksCommandAPIUrl = function (tasks) {
                    var commandAPIUrls = '';

                    for (var i = 0; i < tasks.length; i++) {
                        if (i > 0) {
                            commandAPIUrls += '\n';
                        }

                        commandAPIUrls += getNewTaskCommandAPIUrl(tasks[i]);
                    }

                    return commandAPIUrls;
                };

                var getSettingCommandAPIUrl = function (setting) {
                    var commandAPIUrl = getBaseUrl() + '#!/settings/rpc/set?' +
                        'protocol=' + setting.protocol +
                        '&host=' + setting.rpcHost +
                        '&port=' + setting.rpcPort +
                        '&interface=' + setting.rpcInterface;

                    if (setting.secret) {
                        commandAPIUrl += '&secret=' + ariaNgCommonService.base64UrlEncode(setting.secret);
                    }

                    return commandAPIUrl;
                };

                scope.generateCommandAPIUrl = function () {
                    if (!scope.options) {
                        return;
                    }

                    if (scope.options.type === 'new-task') {
                        scope.context.commandAPIUrl = getNewTasksCommandAPIUrl(scope.options.data);
                    } else if (scope.options.type === 'setting') {
                        scope.context.commandAPIUrl = getSettingCommandAPIUrl(scope.options.data);
                    }

                    scope.context.isCopied = false;
                };

                scope.copyCommandAPI = function () {
                    clipboard.copyText(scope.context.commandAPIUrl, {
                        container: angular.element(element)[0]
                    });
                    scope.context.isCopied = true;
                };

                angular.element(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.options = null;
                        scope.context.commandAPIUrl = null;
                        scope.context.isCopied = false;
                    });
                });

                scope.$watch('options', function (options) {
                    if (options) {
                        scope.generateCommandAPIUrl();
                        scope.context.isCopied = false;

                        angular.element(element).modal('show');
                    }
                }, true);
            }
        };
    }]);
}());
