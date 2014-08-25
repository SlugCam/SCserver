'use strict';

/**
 * @ngdoc function
 * @name sweetappApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the sweetappApp
 * TODO need testing of bounds fitting in the cases with 1 or no markers flagged
 */
angular.module('myApp')
    .controller('DashCtrl', ['$scope', 'apiService', 'leafletData',

        function($scope, apiService, leafletData) {

            $scope.markers = {};
            $scope.camerasWithoutLocation = [];

            apiService.getAllCameras(function(data) {
                $scope.cameras = data;

                data.forEach(function(val) {
                    if (val.lat !== undefined && val.lng !== undefined) {
                        $scope.markers[val.name] = {
                            message: 'Camera: ' + val.name,
                            draggable: false,
                            lat: val.lat,
                            lng: val.lng,
                        };

                    } else {
                        $scope.camerasWithoutLocation.push(val);
                    }
                });
                console.log($scope.camerasWithoutLocation.length);
                $scope.fitMarkers();
            });

            // Check out:
            // https://github.com/Leaflet/Leaflet/blob/master/src/geometry/Bounds.js
            function getMarkerBounds() {
                var a = [];
                Object.keys($scope.markers).forEach(function(k) {
                    var m = $scope.markers[k];
                    var p = L.latLng(m.lat, m.lng);
                    console.log(p)
                    a.push(p);
                });
                return new L.LatLngBounds(a);
            }

            $scope.fitMarkers = function() {
                leafletData.getMap().then(function(map) {
                    map.fitBounds(getMarkerBounds().pad(0.5));
                });
            };
        }
    ]);
