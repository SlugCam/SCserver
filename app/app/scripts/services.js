'use strict';
angular.module('myApp')
    .factory('openVideoModal', ['$rootScope', '$modal',
        function($rootScope, $modal) {
            return function(cam, id) {
                var parent = $rootScope;
                var child = parent.$new();
                child.id = id;
                child.camName = cam;
                $modal.open({
                    templateUrl: 'views/video.html',
                    controller: 'VidModalCtrl',
                    scope: child
                });
            };
        }
    ])
    .factory('apiService', ['$http', 'config',
        function($http, config) {
            var exports = {};

            // type should be 'mp4' or 'avi'
            exports.getVideoUrl = function (camName, vidId, type) {

             return config.apiUrl + 'media/' + camName + '/' +
                vidId.toString() + '.' + type;
            };

            // Callback is called if successful with JS array of all message
            // objects.
            exports.getAllMessages = function(callback) {
                $http.get(config.apiUrl + 'messages').success(callback);
            };

            exports.getAllVideos = function(callback) {
                $http.get(config.apiUrl + 'videos').success(callback);
            };

            exports.getAllCameras = function(callback) {
                $http.get(config.apiUrl + 'cameras').success(callback);
            };

            exports.getCamera = function(camName, callback) {
                $http.get(config.apiUrl + 'cameras/' + camName).success(callback);
            };

            return exports;
        }
    ]);