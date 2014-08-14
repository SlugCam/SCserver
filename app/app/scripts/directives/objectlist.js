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

    })
    .directive('myVideoPlayer', function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            scope: {
                src: '&mySrc'
            },
            template: '<div><img src="/images/video_poster.png" width="100%" /></div>',
            link: function(scope, element, attrs) {
                scope.$watch('src()', function (newSrc) {
                    console.log('New video source', newSrc);
                    if (newSrc != '') {
                        console.log('Go!')
                        var vid = $('<video controls autoplay/>').attr('width', '100%');
                        var src = $('<source />').attr({
                            type: 'video/mp4',
                            src: newSrc
                        });
                        vid.append(src);
                        element.empty();
                        vid.appendTo(element);
                    }
                });
            }
        };

    });
