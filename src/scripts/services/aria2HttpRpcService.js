(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2HttpRpcService', ['$http', 'ariaNgSettingService', 'ariaNgLogService', function ($http, ariaNgSettingService, ariaNgLogService) {
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

                ariaNgLogService.debug('Http Request Start', requestContext);

                return $http(requestContext).success(function (data) {
                    ariaNgLogService.debug('Http Response Success', data);

                    if (!data) {
                        return;
                    }

                    if (context.successCallback) {
                        context.successCallback(data.id, data.result);
                    }
                }).error(function (data) {
                    ariaNgLogService.debug('Http Response Error', data);

                    if (!data) {
                        data = {
                            id: '-1',
                            error: {
                                // code: '-1',
                                // message: 'Unknown Error',
                                innerError: true
                            }
                        };
                    }

                    if (context.errorCallback) {
                        context.errorCallback(data.id, data.error);
                    }
                });
            },
            on: function (eventName, callback) {
                //Not implement
            }
        };
    }]);
}());
