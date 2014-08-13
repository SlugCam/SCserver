'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sweetappApp
 */
angular.module('myApp')
    .controller('LogCtrl', ['$scope', 'openVideoModal', 'apiService',
        function($scope, openVideoModal, apiService) {
            $scope.updateLog = function() {
                apiService.getAllMessages(function(data) {
                    $scope.messages = data;
                });
                apiService.getAllVideos(function(data) {
                    $scope.videos = data;
                });
            };
            $scope.updateLog();

            $scope.openVideo = openVideoModal;
        }
    ]);
