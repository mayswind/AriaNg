(function () {
    'use strict';

    angular.module('ariaNg').directive('ngContextMenu', ['$window', function ($window) {
        return {
            restrict: 'E',
            scope: {
                onShowContextMenu: '&',
                onHideContextMenu: '&'
            },
            link: function (scope, element) {
                var parent = element.parent();

                var getContextMenuStyle = function (e) {
                    var mouseX = e.clientX;
                    var mouseY = e.clientY;
                    var screenWidth = angular.element($window).width();
                    var screenHeight = angular.element($window).height();
                    var menuWidth = element.find('.dropdown-menu').outerWidth();
                    var menuHeight = element.find('.dropdown-menu').outerHeight();
                    var parentOffset = element.offsetParent().offset();

                    var style = {
                        'left': mouseX + angular.element($window).scrollLeft() - parentOffset.left,
                        'top': mouseY + angular.element($window).scrollTop() - parentOffset.top,
                        'position': 'absolute',
                        'z-index': 9999
                    };

                    if ((mouseX + menuWidth > screenWidth) && ((mouseX - menuWidth) > 0)) {
                        style.left -= menuWidth;
                    }

                    if (mouseY + menuHeight > screenHeight) {
                        style.top -= menuHeight;
                    }

                    return style;
                };

                var showMenu = function (event) {
                    if (scope.onShowContextMenu) {
                        scope.onShowContextMenu({
                            type: 'show',
                            target: event.target
                        });
                    }

                    var style = getContextMenuStyle(event);
                    element.css(style);
                    element.addClass('open');
                    event.preventDefault();
                };

                var hideMenu = function (event) {
                    if (!element.hasClass('open')) {
                        return;
                    }

                    if (scope.onHideContextMenu) {
                        scope.onHideContextMenu({
                            type: 'hide',
                            target: event.target
                        });
                    }

                    element.removeClass('open');
                    event.preventDefault();
                    event.stopPropagation();
                };

                var hideMenuByEsc = function (event) {
                    var keyCode = event.keyCode || event.which || event.charCode;

                    if (keyCode === 27) {
                        return hideMenu(event);
                    }
                };

                parent.on('contextmenu', showMenu);
                element.find('li:not(.divider)').on('onmousedown', hideMenu);
                angular.element('html').on('click', hideMenu);
                angular.element('html').on('keydown', hideMenuByEsc);

                scope.$on('$destroy', function() {
                    parent.off('contextmenu', showMenu);
                    element.find('li:not(.divider)').off('onmousedown', hideMenu);
                    angular.element('html').off('click', hideMenu);
                    angular.element('html').off('keydown', hideMenuByEsc);
                });
            }
        };
    }]);
}());
