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

nannyTimeModule.controller('submitTimeController', ['$scope', '$http', '$location',
    function($scope, $http, $location) {
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
        $scope.startTime = new Date();
        $scope.startTime.setHours(7, 0, 0);
        $scope.endTime = new Date();
        $scope.endTime.setHours(17, 0, 0);
        $scope.submissionComplete = false;
        $scope.submissionInProgress = false;

        $scope.submit = function() {
            console.log($scope.startTime + ' ' + createMilitaryTime($scope.startTime));
            console.log($scope.endTime + ' ' + createMilitaryTime($scope.endTime));

            $scope.submissionInProgress = true;

            $http.post('http://nanny.htmlbuffet.com/api/submit', {
                comment: '',
                date: $scope.selectedDate,
                startTime: createMilitaryTime($scope.startTime),
                stopTime: createMilitaryTime($scope.endTime)
            }).then(function() {
                $scope.submissionInProgress = false;
                $scope.submissionComplete = true;
            });
        };

        $scope.submitMoreTime = function() {
            $location.path('/submit');
        }
    }]);