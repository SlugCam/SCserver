angular.module('myApp')
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
