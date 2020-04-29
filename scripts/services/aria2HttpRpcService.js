(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2HttpRpcService', ['$http', 'ariaNgCommonService', 'ariaNgSettingService', 'ariaNgLogService', function ($http, ariaNgCommonService, ariaNgSettingService, ariaNgLogService) {
        var rpcUrl = ariaNgSettingService.getCurrentRpcUrl();
        var method = ariaNgSettingService.getCurrentRpcHttpMethod();

        var getUrlWithQueryString = function (url, parameters) {
            if (!url || url.length < 1) {
                return url;
            }

            var queryString = '';

            for (var key in parameters) {
                if (!parameters.hasOwnProperty(key)) {
                    continue;
                }

                var value = parameters[key];

                if (value === null || angular.isUndefined(value)) {
                    continue;
                }

                if (queryString.length > 0) {
                    queryString += '&';
                }

                if (angular.isObject(value) || angular.isArray(value)) {
                    value = angular.toJson(value);
                    value = ariaNgCommonService.base64Encode(value);
                    value = encodeURIComponent(value);
                }

                queryString += key + '=' + value;
            }

            if (queryString.length < 1) {
                return url;
            }

            if (url.indexOf('?') < 0) {
                queryString = '?' + queryString;
            } else {
                queryString = '&' + queryString;
            }

            return url + queryString;
        };

        return {
            request: function (context) {
                if (!context) {
                    return;
                }

                var requestContext = {
                    url: rpcUrl,
                    method: method
                };

                if (requestContext.method === 'POST') {
                    requestContext.data = context.requestBody;
                } else if (requestContext.method === 'GET') {
                    requestContext.url = getUrlWithQueryString(requestContext.url, context.requestBody);
                }

                ariaNgLogService.debug('[aria2HttpRpcService.request] ' + (context && context.requestBody && context.requestBody.method ? context.requestBody.method + ' ' : '') + 'request start', requestContext);

                return $http(requestContext).then(function onSuccess(response) {
                    var data = response.data;

                    ariaNgLogService.debug('[aria2HttpRpcService.request] ' + (context && context.requestBody && context.requestBody.method ? context.requestBody.method + ' ' : '') + 'response success', response);

                    if (!data) {
                        return;
                    }

                    if (context.connectionSuccessCallback) {
                        context.connectionSuccessCallback({
                            rpcUrl: rpcUrl,
                            method: method
                        });
                    }

                    if (context.successCallback) {
                        context.successCallback(data.id, data.result);
                    }
                }).catch(function onError(response) {
                    var data = response.data;

                    ariaNgLogService.debug('[aria2HttpRpcService.request] ' + (context && context.requestBody && context.requestBody.method ? context.requestBody.method + ' ' : '') + 'response error', response);

                    if (!data) {
                        data = {
                            id: '-1',
                            error: {
                                // code: '-1',
                                // message: 'Unknown Error',
                                innerError: true
                            }
                        };

                        if (context.connectionFailedCallback) {
                            context.connectionFailedCallback({
                                rpcUrl: rpcUrl,
                                method: method
                            });
                        }
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
