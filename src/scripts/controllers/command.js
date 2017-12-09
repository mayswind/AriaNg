(function () {
    'use strict';

    angular.module('ariaNg').controller('CommandController', ['$rootScope', '$window', '$location', '$routeParams', 'base64', 'ariaNgDefaultOptions', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2SettingService', 'aria2TaskService', 'ariaNgLogService', function ($rootScope, $window, $location, $routeParams, base64, ariaNgDefaultOptions, ariaNgCommonService, ariaNgSettingService, aria2SettingService, aria2TaskService, ariaNgLogService) {
        var path = $location.path();

        var doNewTaskCommand = function (url, params) {
            try {
                url = base64.urldecode(url);
            } catch (ex) {
                ariaNgCommonService.showError('URL is not base64 encoded!');
                return false;
            }

            var options = {};

            if (params) {
                for (var key in params) {
                    if (!params.hasOwnProperty(key)) {
                        continue;
                    }

                    if (aria2SettingService.isOptionKeyValid(key)) {
                        options[key] = params[key];
                    }
                }
            }

            $rootScope.loadPromise = aria2TaskService.newUriTask({
                urls: [url],
                options: options
            }, false, function (response) {
                if (!response.success) {
                    return false;
                }

                $location.path('/downloading');
            });

            ariaNgLogService.info('[CommandController] new download: ' + url);

            return true;
        };

        var doSetRpcCommand = function (rpcProtocol, rpcHost, rpcPort, rpcInterface, secret) {
            rpcPort = rpcPort || ariaNgDefaultOptions.rpcPort;
            rpcInterface = rpcInterface || ariaNgDefaultOptions.rpcInterface;
            secret = secret || ariaNgDefaultOptions.secret;

            ariaNgLogService.info('[CommandController] set rpc: ' + rpcProtocol + '://' + rpcHost + ':' + rpcPort + '/' + rpcInterface + ', secret: ' + secret);

            if (!rpcProtocol || (rpcProtocol !== 'http' && rpcProtocol !== 'https' && rpcProtocol !== 'ws' && rpcProtocol !== 'wss')) {
                ariaNgCommonService.showError('Protocol is invalid!');
                return false;
            }

            if (!rpcHost) {
                ariaNgCommonService.showError('RPC host cannot be empty!');
                return false;
            }

            if (secret) {
                try {
                    secret = base64.urldecode(secret);
                } catch (ex) {
                    ariaNgCommonService.showError('RPC secret is not base64 encoded!');
                    return false;
                }
            }

            var newSetting = {
                rpcAlias: '',
                rpcHost: rpcHost,
                rpcPort: rpcPort,
                rpcInterface: rpcInterface,
                protocol: rpcProtocol,
                httpMethod: ariaNgDefaultOptions.httpMethod,
                secret: secret
            };

            if (ariaNgSettingService.isRpcSettingEqualsDefault(newSetting)) {
                $location.path('/downloading');
            } else {
                ariaNgSettingService.setDefaultRpcSetting(newSetting, {
                    keepCurrent: false,
                    forceSet: true
                });

                $location.path('/downloading');
                $window.location.reload();
            }

            return true;
        };

        var doCommand = function (path, params) {
            if (path.indexOf('/new') === 0) {
                return doNewTaskCommand(params.url, params);
            } else if (path.indexOf('/settings/rpc/set') === 0) {
                return doSetRpcCommand(params.protocol, params.host, params.port, params.interface, params.secret);
            } else {
                ariaNgCommonService.showError('Parameter is invalid!');
                return false;
            }
        };

        var allParameters = angular.extend({}, $routeParams, $location.search());

        if (!doCommand(path, allParameters)) {
            $location.path('/downloading');
        }
    }]);
}());
