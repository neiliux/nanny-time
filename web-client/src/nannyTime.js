/* global angular */
var nannyTimeModule = angular.module('nannyTime', ['ngRoute', 'mgcrea.ngStrap']);

nannyTimeModule.config(['$routeProvider', function($routeProvider) {
  $routeProvider
      .when(
      '/report', {
          templateUrl: 'reports.html',
          controller: 'reportsController'
      })
      .when(
      '/submitTime', {
          templateUrl: 'submitTime.html',
          controller: 'submitTimeController'
      })
      .otherwise({
          redirectTo: '/submitTime'
      });
}]);

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
            });
        };

        $scope.add();
    }
]);

nannyTimeModule.controller('reportsController', ['$scope', '$http',
    function($scope, $http) {
        $scope.add = function() {
            $http.post('http://nanny.htmlbuffet.com/api/submit', {
                comment: 'foo',
                date: '2/1/2015',
                start: '2/2/2015 8:00AM',
                end: '2/2/2015 5:00PM'
            });
        };
    }]);

nannyTimeModule.controller('submitTimeController', ['$scope', '$http',
    function($scope, $http) {
        function createMilitaryTime(date) {
            var rawString = date.toLocaleTimeString().toLocaleLowerCase();
            var rawStringParts = rawString.split(':');
            var militaryTime = '';

            if (rawString.indexOf('pm') !== -1) {
                militaryTime += ((parseInt(rawStringParts[0]) + 12)).toString();
            } else {
                militaryTime += rawStringParts[0];
            }

            militaryTime += rawStringParts[1];
            return militaryTime;
        }

        $scope.selectedDate = new Date();
        $scope.startTime = null;
        $scope.endTime = null;

        $scope.submit = function() {
            console.log($scope.startTime + ' ' + createMilitaryTime($scope.startTime));
            console.log($scope.endTime + ' ' + createMilitaryTime($scope.endTime));

            $http.post('http://nanny.htmlbuffet.com/api/submit', {
                comment: '',
                date: $scope.selectedDate,
                startTime: createMilitaryTime($scope.startTime),
                stopTime: createMilitaryTime($scope.endTime)
            });
        };
    }]);