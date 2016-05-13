(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2WebSocketRpcService', ['$websocket', 'ariaNgSettingService', function ($websocket, ariaNgSettingService) {
        var rpcUrl = ariaNgSettingService.getJsonRpcUrl();
        var socketClient = $websocket(rpcUrl);
        var sendIdMapping = {};

        socketClient.onMessage(function (message) {
            if (!message || !message.data) {
                return;
            }

            var content = angular.fromJson(message.data);

            if (!content || !content.id) {
                return;
            }

            var uniqueId = content.id;
            var result = content.result;

            if (!sendIdMapping[uniqueId]) {
                return;
            }

            var context = sendIdMapping[uniqueId];
            var callbackMethod = context.callback;

            if (callbackMethod) {
                callbackMethod(result);
            }

            delete sendIdMapping[uniqueId];
        });

        return {
            request: function (context) {
                if (!context) {
                    return;
                }

                var uniqueId = context.uniqueId;
                var requestBody = angular.toJson(context.requestBody);

                sendIdMapping[uniqueId] = context;

                return socketClient.send(requestBody);
            }
        };
    }]);
})();
