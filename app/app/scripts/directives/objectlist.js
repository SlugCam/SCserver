'use strict';

angular.module('myApp')
    .directive('myObjectList', function() {
        return {
            replace: true,
            transclude: false,
            scope: {
                data: '=data'
            },
            template: '<span></span>',
            link: function(scope, element, attrs) {
                var htmlString = ''; 
                Object.keys(scope.data).forEach(function (key) {
                    htmlString += '<strong>' + key + '</strong>:' + scope.data[key] + '; ';
                    
                });
                element.html(htmlString);
            }
        };

    });
/*
    .directive('myObjectList', function() {
        return {
            replace: true,
            transclude: false,
            scope: {
                data: '=data'
            },
            template: '<class="dl-horizontal list-inline"></dl>',
            link: function(scope, element, attrs) {
                element.empty();

                Object.keys(scope.data).forEach(function (key) {
                    console.log(key + ': ' + scope.data[key]);
                    
                    element.append($('<dt></dt>').text(key));
                    element.append($('<dd></dd>').text(scope.data[key]));
                });

            }
        };

    });
    */
