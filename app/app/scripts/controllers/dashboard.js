/* global moment, $ */
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
    .controller('DashCtrl', ['$scope', 'apiService', 'leafletData', 'leafletEvents',

        function($scope, apiService, leafletData, leafletEvents) {
            var hasMarkers = false;

            angular.extend($scope, {
                messages: [],
                videos: [],
                markers: {},
                camerasWithoutLocation: [],
                dataHash: {},
                selectedCamera: '',
                previewUrl: '',
            });

            $scope.previewVideo = function(camName, vidId) {
                $scope.previewUrl = apiService.getVideoUrl(camName, vidId, 'mp4');
                console.log('previewVideo:', $scope.previewUrl);
            };

            /*
            $scope.$watch('selectedCamera', function () {
                $scope.previewUrl = '';
            });*/

            apiService.getAllCameras(function(data) {
                $scope.cameras = data;

                data.forEach(function(val) {

                    if (val.lat !== undefined && val.lng !== undefined) {
                        hasMarkers = true;
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
                if (hasMarkers) {
                    $scope.fitMarkers();
                }
            });

            // Check out:
            // https://github.com/Leaflet/Leaflet/blob/master/src/geometry/Bounds.js
            function getMarkerBounds() {
                var a = [];
                Object.keys($scope.markers).forEach(function(k) {
                    var m = $scope.markers[k];
                    var p = L.latLng(m.lat, m.lng);
                    a.push(p);
                });
                return new L.LatLngBounds(a);
            }

            $scope.fitMarkers = function() {
                leafletData.getMap().then(function(map) {
                    map.fitBounds(getMarkerBounds().pad(0.5));
                });
            };

            // leaflet events handling
            $scope.leafletEvents = {
                markers: {
                    enable: leafletEvents.getAvailableMarkerEvents(),
                }
            };

            $scope.$on('leafletDirectiveMarker.click', function(event, args) {
                $scope.selectedCamera = args.markerName;
            });

            // Date range picker
            $scope.date = {
                startDate: new Date(moment().subtract(1, 'hours')), //TODO: not efficient
                endDate: new Date()
            };

            $scope.opts = {
                ranges: {
                    'Past Hour': [moment().subtract(1, 'hours'), moment()],
                    'Past Day': [moment().subtract(1, 'days'), moment()],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()]
                },
                timePicker: true,
            };

            //Watch for date changes
            $scope.$watch('date', function() {
                console.log('date changes');
                var b = barrier();

                //TODO Should not rely on a constant
                apiService.getAllMessages(1, 999, function(data) {
                    $scope.messages = data.data;
                    b();
                }, {
                    before: $scope.date.endDate,
                    after: $scope.date.startDate
                });

                //TODO Should not rely on a constant
                apiService.getAllVideos(1, 999, function(data) {
                    $scope.videos = data.data;
                    b();
                }, {
                    before: $scope.date.endDate,
                    after: $scope.date.startDate
                });

            }, false);

            function barrier() {
                var count = 0;

                return function() {
                    if (count === 0) {
                        count++;
                        return;
                    } else {
                        console.log('processing data');
                        processData();
                    }
                };
            }

            // TODO separate into two functions
            function processData() {
                var camHash = {};
                // { camname: { videos, messages}}
                $scope.messages.forEach(function(v) {
                    var myEntry = camHash[v.cam] || {};
                    if (myEntry.messages) {
                        myEntry.messages.push(v);
                    } else {
                        myEntry.messages = [v];
                    }
                    camHash[v.cam] = myEntry;

                });

                $scope.videos.forEach(function(v) {
                    var myEntry = camHash[v.cam] || {};
                    if (myEntry.videos) {
                        myEntry.videos.push(v);
                    } else {
                        myEntry.videos = [v];
                    }
                    camHash[v.cam] = myEntry;
                });
                $scope.dataHash = camHash;


                angular.forEach($scope.markers, function(value, key) {
                    var message = 'Camera: ' + key;
                    if ($scope.dataHash[key]) {
                        if ($scope.dataHash[key].videos) {
                            message += '<br>Videos: ' + $scope.dataHash[key].videos.length;
                        }
                        if ($scope.dataHash[key].messages) {
                            message += '<br>Messages:' + $scope.dataHash[key].messages.length;
                        }
                    }
                    $scope.markers[key].message = message;
                });

            }

        }
    ])
    .directive('activityBar', ['apiService',
        function(apiService) {
            return {
                restrict: 'E',
                replace: true,
                transclude: false,
                scope: true,
                template: '<div class="activity-bar"></div>',
                link: function(scope, element, attrs) {
                    //scope.$watch('dataHash[selectedCamera]', function(cam) {
                    //update();
                    //}, true);
                    scope.$watch('selectedCamera', function(cam) {
                        console.log('selected camera:', cam);
                        update();
                    });

                    function update() {
                        var data = scope.dataHash[scope.selectedCamera],
                            startTime = scope.date.startDate.getTime(),
                            adjustedEndTime = scope.date.endDate.getTime() - startTime;

                        element.empty();
                        var videoBar = $('<div>').addClass('video-bar').appendTo(element);


                        if (!data) {
                            return;
                        }

                        if (data.videos) {
                            data.videos.forEach(function(val) {
                                var vidAdjStart = (new Date(val.startTime)).getTime() - startTime,
                                    vidAdjEnd = (new Date(val.endTime)).getTime() - startTime,
                                    left = (vidAdjStart / adjustedEndTime),
                                    width = (vidAdjEnd / adjustedEndTime) - left;
                                $('<div>')
                                    .addClass('video')
                                    .css({
                                        left: left * 100 + '%',
                                        width: width * 100 + '%'
                                    })
                                    .click(function() {
                                        scope.previewVideo(val.cam, val.id);
                                        //TODO hover, go away change
                                    })
                                    .appendTo(videoBar);
                            });
                        }
                        if (data.messages) {
                            data.messages.forEach(function(val) {
                                var tagAdjTime = (new Date(val.time)).getTime() - startTime,
                                    left = (tagAdjTime / adjustedEndTime),
                                    type = val.type == 'tag' ? 'tag' : 'message';
                                $('<div>')
                                    .addClass(type)
                                    .css({
                                        left: left * 100 + '%',
                                    })
                                    .appendTo(element);
                            });
                        }


                    }
                }
            };
        }
    ]);
