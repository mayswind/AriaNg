(function () {
    'use strict';

    angular.module("ariaNg").filter('taskStatus', ['translateFilter', function (translateFilter) {
        return function (task) {
            if (!task) {
                return '';
            }

            if (task.status == 'active') {
                if (task.seeder === true || task.seeder === 'true') {
                    return translateFilter('Seeding');
                } else {
                    return translateFilter('Downloading');
                }
            } else if (task.status == 'waiting') {
                return translateFilter('Waiting');
            } else if (task.status == 'paused') {
                return translateFilter('Paused');
            } else if (task.status == 'complete') {
                return translateFilter('Completed');
            } else if (task.status == 'error') {
                return translateFilter('Error Occurred') + (task.errorCode ? ' (' + task.errorCode + ')' : '');
            } else if (task.status == 'removed') {
                return translateFilter('Removed');
            } else {
                return '';
            }
        }
    }]);
})();
