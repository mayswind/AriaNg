(function () {
    'use strict';

    angular.module('ariaNg').directive('ngPieceMap', ['aria2TaskService', function (aria2TaskService) {
        return {
            restrict: 'E',
            template: '<div class="piece-map"></div>',
            replace: true,
            scope: {
                bitField: '=',
                pieceCount: '='
            },
            link: function (scope, element) {
                var pieces = [];
                var currentPieceStatus = [];

                var redraw = function () {
                    currentPieceStatus = aria2TaskService.getPieceStatus(scope.bitField, scope.pieceCount);
                    pieces.length = 0;
                    element.empty();

                    var pieceCount = Math.max(1, currentPieceStatus.length);

                    for (var i = 0; i < pieceCount; i++) {
                        var piece = angular.element('<div class="piece' + (currentPieceStatus[i] ? ' piece-completed' : '') + '"></div>');
                        pieces.push(piece);
                        element.append(piece);
                    }
                };

                var refresh = function () {
                    var newPieceStatus = aria2TaskService.getPieceStatus(scope.bitField, scope.pieceCount);

                    if (!currentPieceStatus || !newPieceStatus || currentPieceStatus.length !== newPieceStatus.length || newPieceStatus.length !== pieces.length) {
                        redraw();
                        return;
                    }

                    for (var i = 0; i < pieces.length; i++) {
                        if (currentPieceStatus[i] !== newPieceStatus[i]) {
                            if (newPieceStatus[i]) {
                                pieces[i].addClass('piece-completed');
                            } else {
                                pieces[i].removeClass('piece-completed');
                            }
                        }
                    }

                    currentPieceStatus = newPieceStatus;
                };

                scope.$watch('bitField', function () {
                    refresh();
                });

                scope.$watch('pieceCount', function () {
                    redraw();
                });
            }
        };
    }]);
}());
