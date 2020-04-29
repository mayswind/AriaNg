(function () {
    'use strict';

    angular.module('ariaNg').constant('ariaNgBuildConfiguration', {
        buildVersion: '${ARIANG_VERSION}',
        buildCommit: '${ARIANG_BUILD_COMMIT}'
    });
}());
