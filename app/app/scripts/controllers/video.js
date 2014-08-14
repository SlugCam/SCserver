'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sweetappApp
 */
angular.module('myApp')
    .controller('VidCtrl', ['$scope', '$routeParams', '$log', 'apiService',
        function($scope, $routeParams, $log, apiService) {
            $scope.id = $routeParams.id;
            $scope.camName = $routeParams.cam;
            $log.log('VidCtrl', $scope.id, $scope.camName);
            $scope.mp4Url = apiService.getVideoUrl($scope.camName, $scope.id, 'mp4');
            $scope.aviUrl = apiService.getVideoUrl($scope.camName, $scope.id, 'avi');

        }
    ])
    .controller('VidModalCtrl', ['$scope', '$log', 'apiService',
        function($scope, $log, apiService) {
            $log.log('VidCtrl', $scope.id, $scope.camName);

            $scope.mp4Url = apiService.getVideoUrl($scope.camName, $scope.id, 'mp4');
            $scope.aviUrl = apiService.getVideoUrl($scope.camName, $scope.id, 'avi');
        }
    ]);
