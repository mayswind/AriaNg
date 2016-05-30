(function () {
    'use strict';

    angular.module("ariaNg").filter('taskStatus', ['$translate', function ($translate) {
        return function (task) {
            if (!task) {
                return '';
            }

            if (task.status == 'active') {
                if (task.seeder === true || task.seeder === 'true') {
                    return $translate.instant('Seeding');
                } else {
                    return $translate.instant('Downloading');
                }
            } else if (task.status == 'waiting') {
                return $translate.instant('Waiting');
            } else if (task.status == 'paused') {
                return $translate.instant('Paused');
            } else if (task.status == 'complete') {
                return $translate.instant('Completed');
            } else if (task.status == 'error') {
                return $translate.instant('Error Occurred') + (task.errorCode ? ' (' + task.errorCode + ')' : '');
            } else if (task.status == 'removed') {
                return $translate.instant('Removed');
            } else {
                return '';
            }
        }
    }]);
})();
