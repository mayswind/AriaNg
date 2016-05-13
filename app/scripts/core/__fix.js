(function () {
    'use strict';

    //copy from AdminLTE app.js
    var fixContentWrapperHeight = function () {
        var neg = $('.main-header').outerHeight() + $('.main-footer').outerHeight();
        var window_height = $(window).height();
        var sidebar_height = $(".sidebar").height();

        if ($("body").hasClass("fixed")) {
            $(".content-wrapper, .right-side").css('height', window_height - $('.main-footer').outerHeight());
        } else {
            var postSetWidth;
            if (window_height >= sidebar_height) {
                $(".content-wrapper, .right-side").css('height', window_height - neg);
                postSetWidth = window_height - neg;
            } else {
                $(".content-wrapper, .right-side").css('height', sidebar_height);
                postSetWidth = sidebar_height;
            }

            //Fix for the control sidebar height
            var controlSidebar = $($.AdminLTE.options.controlSidebarOptions.selector);
            if (typeof controlSidebar !== "undefined") {
                if (controlSidebar.height() > postSetWidth)
                    $(".content-wrapper, .right-side").css('height', controlSidebar.height());
            }
        }
    };

    $(window, ".wrapper").resize(function () {
        fixContentWrapperHeight();
    });

    fixContentWrapperHeight();
})();
