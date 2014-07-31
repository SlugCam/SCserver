'use strict';
var baseUrl = 'http://localhost:7891/';

/* Controllers */


angular.module('myApp.controllers', [])
    .controller('LogCtrl', ['$scope', '$http',
        function($scope, $http) {
            $scope.updateLog = function() {
                console.log('updated');
                $http.get(baseUrl + 'dump').success(function(data) {
                    $scope.messages = data;
                });
            };
            $scope.updateLog();
        }
    ])
    .controller('DashCtrl', ['$scope',
        function($scope) {

        }
    ])
    .controller('CamCtrl', ['$scope',
        function($scope) {

        }
    ]);
