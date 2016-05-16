(function () {
    'use strict';

    angular.module('ariaNg').controller('AriaNgSettingsController', ['$scope', 'SweetAlert', 'ariaNgSettingService', function ($scope, SweetAlert, ariaNgSettingService) {
        $scope.settings = ariaNgSettingService.getAllOptions();
        $scope.settingService = ariaNgSettingService;
    }]);
})();
