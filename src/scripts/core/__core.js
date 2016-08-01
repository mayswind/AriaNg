/*!
 * AriaNg
 * https://github.com/mayswind/AriaNg
 */

(function () {
    'use strict';

    var ltIE10 = (function () {
        var browserName = navigator.appName;
        var browserVersions = navigator.appVersion.split(';');
        var browserVersion = (browserVersions && browserVersions.length > 1 ? browserVersions[1].replace(/[ ]/g, '') : '');

        if (browserName === 'Microsoft Internet Explorer' && (browserVersion === 'MSIE6.0' || browserVersion === 'MSIE7.0' || browserVersion === 'MSIE8.0' || browserVersion === 'MSIE9.0')) {
            return true;
        }

        return false;
    })();

    if (ltIE10) {
        var tip = document.createElement('div');
        tip.className = 'alert alert-danger';
        tip.innerHTML = 'Sorry, AriaNg cannot support this browser, please upgrade your browser!';
        document.getElementById('content-wrapper').appendChild(tip);
    }
}());
