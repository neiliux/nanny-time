/* global angular, alert */
var nannyTimeModule = angular.module('nannyTime', []);

nannyTimeModule.controller('app', ['$scope', '$http',
    function ($scope, $http) {
        $scope.x = 1;
        //alert('x');

        $scope.add = function() {
            $http.post('http://nanny.htmlbuffet.com/api/submit', {
                comment: 'foo',
                date: '2/1/2015',
                start: '2/2/2015 8:00AM',
                end: '2/2/2015 5:00PM'
            })
        };

        $scope.add();
    }
]);