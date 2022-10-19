(function () {
    'use strict';

    angular.module('ariaNg').controller('AriaNgDebugController', ['$rootScope', '$scope', '$location', '$interval', '$timeout', 'ariaNgConstants', 'ariaNgCommonService', 'ariaNgLocalizationService', 'ariaNgLogService', 'ariaNgSettingService', function ($rootScope, $scope, $location, $interval, $timeout, ariaNgConstants, ariaNgCommonService, ariaNgLocalizationService, ariaNgLogService, ariaNgSettingService) {
        var tabStatusItems = [
            {
                name: 'logs',
                show: true
            }
        ];
        var debugLogRefreshPromise = null;

        var getVisibleTabOrders = function () {
            var items = [];

            for (var i = 0; i < tabStatusItems.length; i++) {
                if (tabStatusItems[i].show) {
                    items.push(tabStatusItems[i].name);
                }
            }

            return items;
        };

        $scope.context = {
            currentTab: 'logs',
            logMaxCount: ariaNgConstants.cachedDebugLogsLimit,
            logAutoRefreshAvailableInterval: ariaNgCommonService.getTimeOptions([100, 200, 500, 1000, 2000], true),
            logAutoRefreshInterval: 0,
            logListDisplayOrder: 'time:desc',
            logLevelFilter: 'DEBUG',
            logs: [],
            currentLog: null
        };

        $scope.enableDebugMode = function () {
            return ariaNgSettingService.isEnableDebugMode();
        };

        $scope.changeTab = function (tabName) {
            $scope.context.currentTab = tabName;
        };

        $scope.changeLogListDisplayOrder = function (type) {
            var oldType = ariaNgCommonService.parseOrderType($scope.context.logListDisplayOrder);
            var newType = ariaNgCommonService.parseOrderType(type);

            if (newType.type === oldType.type) {
                newType.reverse = !oldType.reverse;
            }

            $scope.context.logListDisplayOrder = newType.getValue();
        };

        $scope.isLogListSetDisplayOrder = function (type) {
            var orderType = ariaNgCommonService.parseOrderType($scope.context.logListDisplayOrder);
            var targetType = ariaNgCommonService.parseOrderType(type);

            return orderType.equals(targetType);
        };

        $scope.getLogListOrderType = function () {
            return $scope.context.logListDisplayOrder;
        };

        $scope.filterLog = function (log) {
            if (!log || !angular.isString(log.level)) {
                return false;
            }

            if (!$scope.context.logLevelFilter) {
                return true;
            }

            return ariaNgLogService.compareLogLevel(log.level, $scope.context.logLevelFilter) >= 0;
        };

        $scope.setLogLevelFilter = function (filter) {
            $scope.context.logLevelFilter = filter;
        };

        $scope.isSetLogLevelFilter = function (filter) {
            return $scope.context.logLevelFilter === filter;
        };

        $scope.getLogLevelFilter = function () {
            return $scope.context.logLevelFilter;
        };

        $scope.setAutoRefreshInterval = function (interval) {
            $scope.context.logAutoRefreshInterval = interval;

            if (debugLogRefreshPromise) {
                $interval.cancel(debugLogRefreshPromise);
            }

            if (interval > 0) {
                $scope.reloadLogs();

                debugLogRefreshPromise = $interval(function () {
                    $scope.reloadLogs();
                }, $scope.context.logAutoRefreshInterval);
            }
        };

        $scope.reloadLogs = function () {
            $scope.context.logs = ariaNgLogService.getDebugLogs().slice();
        };

        $scope.clearDebugLogs = function () {
            ariaNgCommonService.confirm('Confirm Clear', 'Are you sure you want to clear debug logs?', 'warning', function () {
                ariaNgLogService.clearDebugLogs();
                $scope.reloadLogs();
            }, false);
        };

        $scope.showLogDetail = function (log) {
            $scope.context.currentLog = log;
            angular.element('#log-detail-modal').modal();
        };

        $('#log-detail-modal').on('hide.bs.modal', function (e) {
            $scope.context.currentLog = null;
        });

        $scope.$on('$destroy', function () {
            if (debugLogRefreshPromise) {
                $interval.cancel(debugLogRefreshPromise);
            }
        });

        $rootScope.swipeActions.extendLeftSwipe = function () {
            var tabItems = getVisibleTabOrders();
            var tabIndex = tabItems.indexOf($scope.context.currentTab);

            if (tabIndex < tabItems.length - 1) {
                $scope.changeTab(tabItems[tabIndex + 1]);
                return true;
            } else {
                return false;
            }
        };

        $rootScope.swipeActions.extendRightSwipe = function () {
            var tabItems = getVisibleTabOrders();
            var tabIndex = tabItems.indexOf($scope.context.currentTab);

            if (tabIndex > 0) {
                $scope.changeTab(tabItems[tabIndex - 1]);
                return true;
            } else {
                return false;
            }
        };

        $rootScope.loadPromise = $timeout(function () {
            if (!ariaNgSettingService.isEnableDebugMode()) {
                ariaNgCommonService.showError('Access Denied!', function () {
                    if (!ariaNgSettingService.isEnableDebugMode()) {
                        $location.path('/settings/ariang');
                    }
                });
                return;
            }

            $scope.reloadLogs();
        }, 100);
    }]);
}());
