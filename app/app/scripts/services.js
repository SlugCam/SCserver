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
    ]);
