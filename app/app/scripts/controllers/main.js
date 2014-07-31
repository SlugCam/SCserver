'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sweetappApp
 */
angular.module('sweetappApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
