(function () {
    'use strict';

    angular.module('ariaNg').controller('AriaNgSettingsController', ['$scope', 'ariaNgLanguages', 'ariaNgCommonService', 'ariaNgSettingService', function ($scope, ariaNgLanguages, ariaNgCommonService, ariaNgSettingService) {
        $scope.context = {
            languages: ariaNgLanguages,
            availableTime: ariaNgCommonService.getTimeOptions([1000, 2000, 3000, 5000, 10000, 30000, 60000], true),
            settings: ariaNgSettingService.getAllOptions()
        };
        
        $scope.settingService = ariaNgSettingService;
    }]);
})();
