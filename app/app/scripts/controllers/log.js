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

            $scope.previewUrl = '';

            $scope.messagePager = {
                totalItems: 0,
                pageSize: 10,
                page: 1,
                pagerSize: 10
            }

            function updateMessages() {
                apiService.getAllMessages($scope.messagePager.page, $scope.messagePager.pageSize, function(data) {
                    $scope.messages = data.data;
                    $scope.messagePager.totalItems = data.pagination.count;
                });
            }

            $scope.updateLog = function() {
                updateMessages();
                apiService.getAllVideos(function(data) {
                    $scope.videos = data;
                });

            };

            $scope.mPageChanged = function() {
                //console.log('page: ' + $scope.messagePager.page);
                updateMessages();
            };

            $scope.updateLog();

            $scope.openVideo = openVideoModal;

            $scope.previewVideo = function(camName, vidId) {
                console.log('preview');
                $scope.previewUrl = apiService.getVideoUrl(camName, vidId, 'mp4');
            };
        }
    ]);
