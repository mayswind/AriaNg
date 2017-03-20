(function () {
    'use strict';

    angular.module('ariaNg').controller('CommandController', ['$rootScope', '$window', '$location', '$routeParams', 'base64', 'ariaNgDefaultOptions', 'ariaNgCommonService', 'ariaNgSettingService', 'aria2TaskService', 'ariaNgLogService', function ($rootScope, $window, $location, $routeParams, base64, ariaNgDefaultOptions, ariaNgCommonService, ariaNgSettingService, aria2TaskService, ariaNgLogService) {
        var path = $location.path();

        var newUrlDownload = function (url) {
            return aria2TaskService.newUriTask({
                urls: [url],
                options: {}
            }, false, function (response) {
                if (!response.success) {
                    return;
                }

                $location.path('/downloading');
            });
        };

        if (path.indexOf('/new/') === 0) {
            var base64Url = $routeParams.url;
            var url = base64.urldecode(base64Url);
            $rootScope.loadPromise = newUrlDownload(url);
            ariaNgLogService.info('[CommandController] new download: ' + url);
        } else if (path.indexOf('/settings/rpc/set/') === 0) {
            var rpcProtocol = $routeParams.protocol;
            var rpcHost = $routeParams.host;
            var rpcPort = $routeParams.port || ariaNgDefaultOptions.rpcPort;
            var rpcInterface =$routeParams.interface || ariaNgDefaultOptions.rpcInterface;
            var secret = $routeParams.secret || ariaNgDefaultOptions.secret;

            ariaNgLogService.info('[CommandController] set rpc: ' + rpcProtocol + '://' + rpcHost + ':' + rpcPort + '/' + rpcInterface + ', secret: ' + secret);

            if (!rpcProtocol || (rpcProtocol !== 'http' && rpcProtocol !== 'https' && rpcProtocol !== 'ws' && rpcProtocol !== 'wss')) {
                ariaNgCommonService.showError('Protocol is invalid!');
                return;
            }

            if (!rpcHost) {
                ariaNgCommonService.showError('RPC host cannot be empty!');
                return;
            }

            if (secret) {
                try {
                    secret = base64.urldecode(secret);
                } catch (ex) {
                    ariaNgCommonService.showError('RPC secret is not base64 encoded!');
                    return;
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
        } else {
            ariaNgCommonService.showError('Parameter is invalid!');
        }
    }]);
}());
