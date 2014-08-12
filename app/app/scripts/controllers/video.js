'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sweetappApp
 */
angular.module('myApp')
    .controller('VidCtrl', ['$scope', '$routeParams', '$log', 'config',
        function($scope, $routeParams, $log, config) {
            $scope.id = $routeParams.id;
            $scope.camName = $routeParams.cam;
            $log.log('VidCtrl', $scope.id, $scope.camName);
            var videoUrl = config.apiUrl + 'media/' + $scope.camName + '/' +
                $scope.id.toString();
            $scope.mp4Url = videoUrl + '.mp4';
            $scope.aviUrl = videoUrl + '.avi';

        }
    ])
    .controller('VidModalCtrl', ['$scope', '$log', 'config',
        function($scope, $log, config) {
            $log.log('VidCtrl', $scope.id, $scope.camName);
            var videoUrl = config.apiUrl + 'media/' + $scope.camName + '/' +
                $scope.id.toString();
            $scope.mp4Url = videoUrl + '.mp4';
            $scope.aviUrl = videoUrl + '.avi';

        }
    ]);
