(function () {
    'use strict';

    angular.module('ariaNg').config(['$translateProvider', 'localStorageServiceProvider', 'ariaNgConstants', function ($translateProvider, localStorageServiceProvider, ariaNgConstants) {
        localStorageServiceProvider
            .setPrefix(ariaNgConstants.appPrefix)
            .setStorageType('localStorage')
            .setStorageCookie(365, '/');

        $translateProvider.preferredLanguage('en-US');
        $translateProvider.useSanitizeValueStrategy('escape');
    }]).run(['$translate', 'amMoment', 'moment', 'ariaNgConstants', 'ariaNgSettingService', function ($translate, amMoment, moment, ariaNgConstants, ariaNgSettingService) {
        $translate.use(ariaNgSettingService.getLanguage());

        moment.updateLocale('zh-cn', {
            week: null
        });

        amMoment.changeLocale(ariaNgSettingService.getLanguage());
    }]).run(['$rootScope', '$location', '$document', 'SweetAlert', 'ariaNgConstants', 'utils', function ($rootScope, $location, $document, SweetAlert, ariaNgConstants, utils) {
        var setNavbarSelected = function (location) {
            angular.element('section.sidebar > ul li').removeClass('active');
            angular.element('section.sidebar > ul > li[data-href-match]').each(function (index, element) {
                var match = angular.element(element).attr('data-href-match');

                if (utils.isUrlMatchUrl2(match, location)) {
                    angular.element(element).addClass('active');
                }
            });

            angular.element('section.sidebar > ul > li.treeview > ul.treeview-menu > li[data-href-match]').each(function (index, element) {
                var match = angular.element(element).attr('data-href-match');

                if (utils.isUrlMatchUrl2(match, location)) {
                    angular.element(element).addClass('active').parent().parent().addClass('active');
                }
            });
        };

        var showSidebar = function () {
            angular.element('body').removeClass('sidebar-collapse').addClass('sidebar-open');
        };

        var hideSidebar = function () {
            angular.element('body').addClass('sidebar-collapse').removeClass('sidebar-open');
        };

        var isSidebarShowInSmallScreen = function () {
            return angular.element('body').hasClass('sidebar-open');
        };

        $rootScope.swipeActions = {
            leftSwipe: function () {
                if (isSidebarShowInSmallScreen()) {
                    hideSidebar();
                    return;
                }

                if (!this.extentLeftSwipe ||
                    (angular.isFunction(this.extentLeftSwipe) && !this.extentLeftSwipe())) {
                    hideSidebar();
                }
            },
            rightSwipe: function () {
                if (!this.extentRightSwipe ||
                    (angular.isFunction(this.extentRightSwipe) && !this.extentRightSwipe())) {
                    showSidebar();
                }
            }
        };

        $rootScope.$on('$locationChangeStart', function (event) {
            delete $rootScope.swipeActions.extentLeftSwipe;
            delete $rootScope.swipeActions.extentRightSwipe;

            SweetAlert.close();
        });

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            var location = $location.path();

            setNavbarSelected(location);
            $document.unbind('keypress');
        });
    }]);
})();
