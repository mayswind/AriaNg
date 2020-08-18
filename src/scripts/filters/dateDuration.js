(function () {
    'use strict';

    angular.module('ariaNg').filter('dateDuration', ['moment', function (moment) {
        return function (duration, sourceUnit, format) {
            var timespan = moment.duration(duration, sourceUnit);
            var time = moment.utc(timespan.asMilliseconds());
            return time.format(format);
        };
    }]);
}());
