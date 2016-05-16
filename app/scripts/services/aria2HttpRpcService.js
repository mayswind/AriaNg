(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2HttpRpcService', ['$http', 'ariaNgSettingService', function ($http, ariaNgSettingService) {
        var rpcUrl = ariaNgSettingService.getJsonRpcUrl();

        return {
            request: function (context) {
                if (!context) {
                    return;
                }

                var requestContext = {
                    url: rpcUrl,
                    method: 'POST',
                    data: context.requestBody
                };

                return $http(requestContext).success(function (data, header, config, status) {
                    if (!data || !data.result) {
                        return;
                    }

                    if (context.callback) {
                        context.callback(data.result);
                    }
                }).error(function (data, header, config, status) {
                    //Do Nothing
                });
            }
        };
    }]);
})();
