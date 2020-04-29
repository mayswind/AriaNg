(function () {
    'use strict';

    angular.module('ariaNg').filter('reverse', function () {
        return function(array) {
            if (!array) {
                return array;
            }

            return array.slice().reverse();
        };
    });
}());
