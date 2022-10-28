(function () {
    'use strict';

    angular.module('ariaNg').factory('ariaNgVersionService', ['ariaNgBuildConfiguration', function (ariaNgBuildConfiguration) {
        return {
            getBuildVersion: function () {
                return ariaNgBuildConfiguration.buildVersion;
            },
            getBuildCommit: function () {
                return ariaNgBuildConfiguration.buildCommit;
            }
        };
    }]);
}());
