'use strict';
angular.module('myApp')
    .filter('trusted', ['$sce',
        function($sce) {
            return function(url) {
                return $sce.trustAsResourceUrl(url);
            };
        }
    ])
    .filter('fromUnixTime', function() {
        return function(unixTime) {
            return (new Date(unixTime * 1000)).toLocaleString();
        };
    });
