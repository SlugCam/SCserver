'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sweetappApp
 */
angular.module('myApp')
    .controller('LogCtrl', ['$scope', '$http', 'openVideoModal', 'config',
        function($scope, $http, openVideoModal, config) {
            $scope.updateLog = function() {
                $http.get(config.apiUrl + 'messages').success(function(data) {
                    $scope.messages = data;
                });
                $http.get(config.apiUrl + 'videos').success(function(data) {
                    $scope.videos = data;
                });
            };
            $scope.updateLog();

            $scope.openVideo = openVideoModal;
        }
    ]);
