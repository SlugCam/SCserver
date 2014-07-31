'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashCtrl'});
  $routeProvider.when('/log', {templateUrl: 'partials/log.html', controller: 'LogCtrl'});
  $routeProvider.when('/cameras', {templateUrl: 'partials/cameras.html', controller: 'CamCtrl'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
