(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2WebSocketRpcService', ['$q', '$websocket', 'ariaNgSettingService', function ($q, $websocket, ariaNgSettingService) {
        var rpcUrl = ariaNgSettingService.getJsonRpcUrl();
        var socketClient = null;
        var sendIdStates = {};

        var getSocketClient = function () {
            if (socketClient == null) {
                socketClient = $websocket(rpcUrl);

                socketClient.onMessage(function (message) {
                    if (!message || !message.data) {
                        return;
                    }

                    var content = angular.fromJson(message.data);

                    if (!content || !content.id) {
                        return;
                    }

                    var uniqueId = content.id;

                    if (!sendIdStates[uniqueId]) {
                        return;
                    }

                    var state = sendIdStates[uniqueId];

                    if (!state) {
                        return;
                    }

                    var context = state.context;
                    var callbackMethod = context.callback;

                    state.deferred.resolve({
                        success: true,
                        context: context
                    });

                    if (callbackMethod) {
                        if (content.result) {
                            callbackMethod(content.result);
                        } else if (content.error) {
                            callbackMethod(content.error);
                        }
                    }

                    delete sendIdStates[uniqueId];
                });
            }

            return socketClient;
        };

        return {
            request: function (context) {
                if (!context) {
                    return;
                }

                var client = getSocketClient();
                var uniqueId = context.uniqueId;
                var requestBody = angular.toJson(context.requestBody);

                var deferred = $q.defer();

                sendIdStates[uniqueId] = {
                    context: context,
                    deferred: deferred
                };

                client.send(requestBody);

                return deferred.promise;
            }
        };
    }]);
})();
