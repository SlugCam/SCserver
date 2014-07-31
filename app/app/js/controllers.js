'use strict';
var baseUrl = 'http://localhost:7891/';

/* Controllers */


angular.module('myApp.controllers', [])
    .controller('MyCtrl1', ['$scope', '$http',
        function($scope, $http) {
            $http.get(baseUrl + 'dump').success(function(data) {
                $scope.messages = data;
            });
        }
    ])
    .controller('MyCtrl2', ['$scope',
        function($scope) {

        }
    ]);
