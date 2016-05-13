(function () {
    'use strict';

    angular.module("ariaNg").filter('substring', function () {
        return function (value, count) {
            if (!value) {
                return value;
            }

            var actualCount = Math.round(count);

            for (var i = 0; i < value.length; i++) {
                var ch = value.charAt(i);
                var code = value.charCodeAt(i);

                if (code < 128) {
                    if (!('A' <= ch && ch <= 'Z')) {
                        actualCount++;
                    }
                }
            }

            actualCount = Math.round(actualCount);

            if (value.length > actualCount) {
                value = value.substring(0, actualCount) + '...';
            }

            return value;
        }
    });
})();
