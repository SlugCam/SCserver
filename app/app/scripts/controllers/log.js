'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sweetappApp
 */
angular.module('myApp')
    .controller('LogCtrl', ['$scope', '$http',
        function($scope, $http) {
            $scope.updateLog = function () {
                $http.get(config.apiUrl + 'messages').success(function(data) {
                    $scope.messages = data;
                });
                $http.get(config.apiUrl + 'videos').success(function(data) {
                    $scope.videos = data;
                });
            };
            $scope.updateLog();

            $scope.fromUnixTime = function (unixTime) {
                return (new Date(unixTime * 1000)).toLocaleString();
            };
        }
    ]);
