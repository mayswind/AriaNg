(function () {
    'use strict';

    angular.module('ariaNg').directive('ngPieceBar', ['aria2TaskService', function (aria2TaskService) {
        return {
            restrict: 'E',
            template: '<canvas class="piece-bar progress"></canvas>',
            replace: true,
            scope: {
                bitField: '=',
                pieceCount: '=',
                color: '@'
            },
            link: function (scope, element) {
                var redraw = function () {
                    var canvas = element[0];
                    var combinedPieces = aria2TaskService.getCombinedPieces(scope.bitField, scope.pieceCount);
                    var context = canvas.getContext('2d');
                    context.fillStyle = scope.color || '#000';
                    context.clearRect(0, 0, canvas.width, canvas.height);

                    var posX = 0;
                    var width = canvas.width;
                    var height = canvas.height;

                    for (var i = 0; i < combinedPieces.length; i++) {
                        var piece = combinedPieces[i];
                        var pieceWidth = piece.count / scope.pieceCount * width;

                        if (piece.isCompleted) {
                            context.fillRect(posX, 0, pieceWidth, height);
                        }

                        posX += pieceWidth;
                    }
                };

                scope.$watch('bitField', function () {
                    redraw();
                });

                scope.$watch('pieceNumber', function () {
                    redraw();
                });
            }
        };
    }]);
}());
