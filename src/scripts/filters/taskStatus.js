(function () {
    'use strict';

    angular.module('ariaNg').filter('taskStatus', function () {
        return function (task) {
            if (!task) {
                return '';
            }

            if (task.status === 'active') {
                if (task.seeder === true || task.seeder === 'true') {
                    return 'Seeding';
                } else {
                    return 'Downloading';
                }
            } else if (task.status === 'waiting') {
                return 'Waiting';
            } else if (task.status === 'paused') {
                return 'Paused';
            } else if (task.status === 'complete') {
                return 'Completed';
            } else if (task.status === 'error') {
                return (task.errorCode ? 'format.task.error-occurred' : 'Error Occurred');
            } else if (task.status === 'removed') {
                return 'Removed';
            } else {
                return '';
            }
        };
    });
}());
