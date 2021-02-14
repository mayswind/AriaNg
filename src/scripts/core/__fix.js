(function () {
    'use strict';

    //copy from AdminLTE app.js
    var fixContentWrapperHeight = function () {
        var windowHeight = $(window).height();
        var neg = $('.main-header').outerHeight() + $('.main-footer').outerHeight();

        $('.content-body').css('height', windowHeight - neg);
    };

    $(window, '.wrapper').resize(function () {
        fixContentWrapperHeight();

        setInterval(function(){
            fixContentWrapperHeight();
        }, 1);
    });

    fixContentWrapperHeight();
}());
