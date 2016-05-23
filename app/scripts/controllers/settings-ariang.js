(function () {
    'use strict';

    angular.module('ariaNg').controller('AriaNgSettingsController', ['$scope', 'ariaNgLanguages', 'ariaNgSettingService', function ($scope, ariaNgLanguages, ariaNgSettingService) {
        $scope.languages = ariaNgLanguages;
        $scope.settings = ariaNgSettingService.getAllOptions();
        $scope.settingService = ariaNgSettingService;
    }]);
})();
