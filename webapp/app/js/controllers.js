'use strict';
var baseUrl = 'http://localhost:7891/';

/* Controllers */


angular.module('myApp.controllers', [])
    .controller('MyCtrl1', ['$scope', '$http',
        function($scope, $http) {
            $http.get(baseUrl + 'dump').success(function(data) {
                $scope.messages = data;
            });
            window.setInterval(function() {
                $http.get(baseUrl + 'dump').success(function(data) {
                    $scope.messages = data;
                });
            }, 2000);



        }
    ])
    .controller('MyCtrl2', ['$scope',
        function($scope) {

        }
    ]);
