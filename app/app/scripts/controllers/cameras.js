'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sweetappApp
 */
angular.module('myApp')
    .controller('CamCtrl', function($scope, $http) {
        $scope.update = function() {
            $http.get(config.apiUrl + 'cameras').success(function(data) {
                $scope.cameras = data;
            });
        };
        $scope.update();
    });
