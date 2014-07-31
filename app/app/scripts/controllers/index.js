'use strict';

angular.module('myApp')
    .controller('IndexCtrl', function($scope, $location) {
        // Borrowed from:
        // http://stackoverflow.com/questions/16199418/how-do-i-implement-the-bootstrap-navbar-active-class-with-angular-js
        $scope.isActive = function(viewLocation) {
            var active = (viewLocation === $location.path());
            return active;
        };
    });
