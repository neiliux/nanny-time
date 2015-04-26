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
      '/submit/:name', {
          templateUrl: 'submitTime.html',
          controller: 'submitTimeController'
      })
      .when(
      '/invalidRequest', {
          templateUrl: 'invalidRequest.html'
      })
      .otherwise({
          redirectTo: '/invalidRequest'
      });
}]);

nannyTimeModule.service('DateService', [
    function() {
        function isSameDate(dateA, dateB) {
            var momentDateA = moment(dateA),
                momentDateB = moment(dateB);

            return momentDateA.isSame(momentDateB, 'year') &&
                momentDateA.isSame(momentDateB, 'month') &&
                momentDateA.isSame(momentDateB, 'day');
        }

        function isInRange(date) {
            var momentDate = moment(date);

            return (momentDate.isAfter(this.start) || isSameDate(momentDate, this.start)) &&
                    (momentDate.isBefore(this.end) || isSameDate(momentDate, this.end));
        }

        return {
            isSameDate: isSameDate,
            isInRange: isInRange
        };
    }
]);

nannyTimeModule.service('PayPeriodService', ['DateService',
    function(dateService) {
        return {
            generatePayPeriods: function() {
                var periods = [],
                    startDate = moment(new Date(2015, 3, 4));

                // TODO: Refactor so periods can be generated real-time based on
                // submitted time.
                for (var i=0; i<1024; i++) {
                    var startOfNextPayPeriod = startDate.clone().add(14, 'days').minutes(0).seconds(0).hours(0);
                    var endOfCurrentPayPeriod = startOfNextPayPeriod.clone().subtract(1, 'days').minutes(0).seconds(0).hours(0);

                    periods.push({
                        start: startDate,
                        end: endOfCurrentPayPeriod,
                        inRange: dateService.isInRange,
                        times: []
                    });

                    startDate = startOfNextPayPeriod;
                }

                return periods;
            }
        };
    }
]);

nannyTimeModule.controller('reportsController', ['$scope', '$http', 'PayPeriodService', 'DateService',
    function($scope, $http, payPeriodService, dateService) {
        var payPeriods = payPeriodService.generatePayPeriods();

        $http.get('http://nanny.htmlbuffet.com/api/get')
            .then(function(result) {
                var timeSubmissions = result.data;

                // TODO: This is inefficient.
                _.each(payPeriods, function(payPeriod) {
                    _.each(timeSubmissions, function(submission) {
                        submission.StopTime = submission.StopTime.toString();
                        submission.StartTime = submission.StartTime.toString();

                        if (submission.StopTime.length < 4) {
                            submission.StopTime = '0' + submission.StopTime;
                        }

                        if (submission.StartTime.length < 4) {
                            submission.StartTime = '0' + submission.StartTime;
                        }

                        submission.Date = moment(submission.Date).minutes(0).seconds(0).hours(0).toDate();

                        if (payPeriod.inRange(submission.Date)) {
                            payPeriod.times.push(submission);
                        }
                    });
                });
            });

        $scope.getTimePeriods = function() {
            return _.filter(payPeriods, function(period) {
                return period.times.length > 0;
            });
        };

        $scope.calculateTotalHours = function(period) {
            return _.reduce(period.times, calculateTotal, 0) / 60;

            function calculateTotal(memo, time) {
                memo += (convertToMinutes(time.StopTime) - convertToMinutes(time.StartTime));
                return memo;
            }
        };

        $scope.calculateWeekOneHours = function(period) {
            var endFirstWeekDate = moment(period.start).add(6, 'days');

            return convertToHoursWithOvertime(
                _.reduce(period.times, calculateTotal, 0));

            function calculateTotal(memo, time) {
                if (moment(time.Date).isBefore(endFirstWeekDate) ||
                    dateService.isSameDate(time.Date, endFirstWeekDate)) {
                    memo += convertToMinutes(time.StopTime) - convertToMinutes(time.StartTime);
                }
                return memo;
            }
        };

        $scope.calculateWeekTwoHours = function(period) {
            var startSecondWeekDate = moment(period.end).subtract(6, 'days');

            return convertToHoursWithOvertime(
                _.reduce(period.times, calculateTotal, 0));

            function calculateTotal(memo, time) {
                if (moment(time.Date).isAfter(startSecondWeekDate) ||
                    dateService.isSameDate(time.Date, startSecondWeekDate) ||
                    dateService.isSameDate(time.Date, period.end)) {
                    memo += convertToMinutes(time.StopTime) - convertToMinutes(time.StartTime);
                }
                return memo;
            }
        };

        function convertToHoursWithOvertime(totalMinutes) {
            var totalHours = totalMinutes / 60;
            return {
                hours: Math.min(totalHours, 40),
                overtime: Math.max(totalHours - 40, 0)
            }
        }

        function convertToMinutes(militaryTime) {
            var timeString = militaryTime.toString();
            var subHours = timeString.substr(0, 2);
            var subMinutes = timeString.substr(2, 2);
            var hour = parseInt(subHours);
            var minutes = parseInt(subMinutes);
            return (hour*60) + minutes;
        }
    }]);

nannyTimeModule.controller('submitTimeController', ['$scope', '$http', '$location', '$routeParams',
    function($scope, $http, $location, $routeParams) {
        function createMilitaryTime(date) {
            var rawString = date.toLocaleTimeString().toLocaleLowerCase();
            var rawStringParts = rawString.split(':');
            var militaryTime = '';

            if (rawString.indexOf('pm') !== -1) {
                var hour = parseInt(rawStringParts[0]);
                if (hour !== 12) {
                    militaryTime += ((parseInt(rawStringParts[0]) + 12)).toString();
                } else {
                    militaryTime += hour.toString();
                }
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
            $scope.submissionInProgress = true;

            $http.post('http://nanny.htmlbuffet.com/api/submit', {
                comment: '',
                date: $scope.selectedDate,
                startTime: createMilitaryTime($scope.startTime),
                stopTime: createMilitaryTime($scope.endTime),
                name: $routeParams.name
            }).then(function() {
                $scope.submissionInProgress = false;
                $scope.submissionComplete = true;
            });
        };

        $scope.submitMoreTime = function() {
            $scope.submissionInProgress = false;
            $scope.submissionComplete = false;
            $location.path('/submit/' + $routeParams.name);
        }
    }]);