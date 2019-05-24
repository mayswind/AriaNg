(function () {
    'use strict';

    angular.module('ariaNg').filter('taskStatus', function () {
        return function (task, simplify) {
            if (!task) {
                return '';
            }

            if (task.status === 'active') {
                if (task.verifyIntegrityPending) {
                    return 'Pending Verification';
                } else if (task.verifiedLength) {
                    return (task.verifiedPercent ? 'format.task.verifying-percent' : 'Verifying');
                } else if (task.seeder === true || task.seeder === 'true') {
                    return 'Seeding';
                } else {
                    return 'Downloading';
                }
            } else if (task.status === 'waiting') {
                return 'Waiting';
            } else if (task.status === 'paused') {
                return 'Paused';
            } else if (!simplify && task.status === 'complete') {
                return 'Completed';
            } else if (!simplify && task.status === 'error') {
                return (task.errorCode ? 'format.task.error-occurred' : 'Error Occurred');
            } else if (!simplify && task.status === 'removed') {
                return 'Removed';
            } else {
                return '';
            }
        };
    });
}());
