'use strict';

/**
 * @ngdoc overview
 * @name sweetappApp
 * @description
 * # sweetappApp
 *
 * Main module of the application.
 */
angular
  .module('myApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'leaflet-directive',
    'ui.bootstrap',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashCtrl'
      })
      .when('/video/:cam/:id', {
        templateUrl: 'views/video.html',
        controller: 'VidCtrl'
      })
      .when('/cameras', {
        templateUrl: 'views/cameras.html',
        controller: 'CamCtrl'
      })
      .when('/cameras/:name', {
        templateUrl: 'views/camera_config.html',
        controller: 'CamConfigCtrl'
      })
      .when('/help', {
        templateUrl: 'views/help.html',
        controller: 'HelpCtrl'
      })
      .when('/log', {
        templateUrl: 'views/log.html',
        controller: 'LogCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
