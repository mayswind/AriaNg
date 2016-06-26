(function () {
    'use strict';

    angular.module('ariaNg').controller('AriaNgSettingsController', ['$rootScope', '$scope', '$timeout', 'ariaNgLanguages', 'ariaNgCommonService', 'ariaNgSettingService', 'ariaNgNotificationService', function ($rootScope, $scope, $timeout, ariaNgLanguages, ariaNgCommonService, ariaNgSettingService, ariaNgNotificationService) {
        $scope.context = {
            languages: ariaNgLanguages,
            availableTime: ariaNgCommonService.getTimeOptions([1000, 2000, 3000, 5000, 10000, 30000, 60000], true),
            trueFalseOptions: [{name: 'True', value: true}, {name: 'False', value: false}],
            settings: ariaNgSettingService.getAllOptions(),
            supportBrowserNotification: ariaNgNotificationService.isSupportBrowserNotification()
        };

        $scope.settingService = ariaNgSettingService;

        $scope.setEnableBrowserNotification = function (value) {
            ariaNgSettingService.setBrowserNotification(value);

            if (value && !ariaNgNotificationService.hasBrowserPermission()) {
                ariaNgNotificationService.requestBrowserPermission(function (permission) {
                    if (!ariaNgNotificationService.isPermissionGranted(permission)) {
                        $scope.context.settings.browserNotification = false;
                        ariaNgCommonService.showError('You have disabled notification in your browser. You should change your browser\'s settings before you enable this function.');
                    }
                });
            }
        };

        $rootScope.loadPromise = $timeout(function () {
            ;//Do Nothing
        }, 100);
    }]);
})();
