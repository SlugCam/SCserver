'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sweetappApp
 */
angular.module('myApp')
    .controller('VidCtrl', ['$scope', '$routeParams',
        function($scope, $routeParams) {
            $scope.id = $routeParams.id;
            $scope.camName = $routeParams.cam;
            var videoUrl = config.apiUrl + 'media/' + $scope.camName + '/' +
                $scope.id.toString();
            $scope.mp4Url = videoUrl + '.mp4';
            $scope.aviUrl = videoUrl + '.avi';

        }
    ])
    .filter('trusted', ['$sce', function ($sce) {
            return function(url) {
                        return $sce.trustAsResourceUrl(url);
                            };
    }]);;
