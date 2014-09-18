'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sweetappApp
 */
angular.module('myApp')
    .controller('LogCtrl', ['$scope', 'openVideoModal', 'apiService', '$location',
        function($scope, openVideoModal, apiService, $location) {

            $scope.previewUrl = '';

            $scope.messagePager = {
                totalItems: 0,
                pageSize: 10,
                page: 1,
                pagerSize: 10
            }

            $scope.videoPager = {
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

            function updateVideos() {
                apiService.getAllVideos($scope.messagePager.page, $scope.messagePager.pageSize, function(data) {
                    $scope.videos = data.data;
                    $scope.videoPager.totalItems = data.pagination.count;
                });
            }

            $scope.updateLog = function() {
                updateMessages();
                updateVideos();
            };

            $scope.mPageChanged = function() {
                updateMessages();
            };
            $scope.vPageChanged = function() {
                updateVideos();
            };

            $scope.updateLog();

            $scope.openVideo = openVideoModal;

            $scope.previewVideo = function(camName, vidId) {
                console.log('preview');
                $scope.previewUrl = apiService.getVideoUrl(camName, vidId, 'mp4');
            };
        }
    ]);
