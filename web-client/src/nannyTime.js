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

nannyTimeModule.service('PayPeriodService', [
    function() {
        function isSameDate(dateA, dateB) {
            return moment(dateA).isSame(moment(dateB), 'year') &&
                moment(dateA).isSame(moment(dateB), 'month') &&
                moment(dateA).isSame(moment(dateB), 'day');
        }

        function isInRange(date) {
            return (moment(date).isAfter(this.start) ||
                    isSameDate(moment(date), this.start)) &&
                    (moment(date).isBefore(this.end) ||
                    isSameDate(moment(date), this.end));
        }

        return {
            generatePayPeriods: function() {
                var periods = [],
                    startDate = moment(new Date(2015, 3, 4));

                for (var i=0; i<100; i++) {
                    var startOfNextPayPeriod = startDate.clone().add(14, 'days').minutes(0).seconds(0).hours(0);
                    var endOfCurrentPayPeriod = startOfNextPayPeriod.clone().subtract(1, 'days').minutes(0).seconds(0).hours(0);

                    periods.push({
                        start: startDate,
                        end: endOfCurrentPayPeriod,
                        inRange: isInRange,
                        times: []
                    });

                    startDate = startOfNextPayPeriod;
                }

                return periods;
            }
        };
    }
]);

nannyTimeModule.controller('reportsController', ['$scope', '$http', 'PayPeriodService',
    function($scope, $http, payPeriodService) {
        var bleh;

        $http.get('http://nanny.htmlbuffet.com/api/get')
            .then(function(result) {
               console.log(result);

                _.each(result.data, function(period) {
                    period.StopTime = period.StopTime.toString();
                    period.StartTime = period.StartTime.toString();

                    if (period.StopTime.length < 4) {
                        period.StopTime = '0' + period.StopTime;
                    }

                    if (period.StartTime.length < 4) {
                        period.StartTime = '0' + period.StartTime;
                    }

                    period.Date = moment(period.Date).minutes(0).seconds(0).hours(0).toDate();
                });

                var times = result.data;
                var x = payPeriodService.generatePayPeriods();
                _.each(x, function(item) {
                    console.log('Pay Period ' + item.start.toString() + ' end ' + item.end.toString());
                    _.each(times, function(t) {
                        if (item.inRange(t.Date)) {
                            console.log('in range! ' + t.Date.toString());
                            item.times.push(t);
                        }
                    });
                });
                bleh = x;
            });

        $scope.getTimePeriods = function() {
            var items = [];
            _.each(bleh, function(b) {
                if (b.times.length > 0) {
                    items.push(b);
                }
            });
            return items;
        };

        $scope.calculateTotalHours = function(period) {
            var total = 0;
            _.each(period.times, function(t) {
                var x = convertToMinutes(t.StopTime) - convertToMinutes(t.StartTime);
                total += x;
            });
            return total/60;
        };

        $scope.calculateWeekOneHours = function(period) {
            var endFirstWeekDate = moment(period.start).add(6, 'days');
            console.log('end of first week: ' + endFirstWeekDate.toString());
            console.log('start period: ' + period.start.toString());

            var total = 0;
            _.each(period.times, function(time) {
                if (moment(time.Date).isBefore(endFirstWeekDate) ||
                    isSameDate(time.Date, endFirstWeekDate)) {
                    console.log('adding week one hours: ' + moment(time.Date).toDate());
                    total += convertToMinutes(time.StopTime) - convertToMinutes(time.StartTime);
                }
            });

            return convertToHoursWithOvertime(total);
        };

        $scope.calculateWeekTwoHours = function(period) {
            var startSecondWeekDate = moment(period.end).subtract(6, 'days');
            console.log('start of second week: ' + startSecondWeekDate.toString());
            console.log('end period: ' + period.end.toString());

            var total = 0;
            _.each(period.times, function(time) {
                if (moment(time.Date).isAfter(startSecondWeekDate) ||
                        isSameDate(time.Date, startSecondWeekDate) ||
                        isSameDate(time.Date, period.end)) {
                    console.log('adding week two hours: ' + moment(time.Date).toDate());
                    total += convertToMinutes(time.StopTime) - convertToMinutes(time.StartTime);
                }
            });

            return convertToHoursWithOvertime(total);
        };

        function isSameDate(dateA, dateB) {
            return moment(dateA).isSame(moment(dateB), 'year') &&
                moment(dateA).isSame(moment(dateB), 'month') &&
            moment(dateA).isSame(moment(dateB), 'day');
        }

        function convertToHoursWithOvertime(totalMinutes) {
            var totalHours = totalMinutes / 60;
            return {
                hours: Math.min(totalHours, 40),
                overtime: Math.max(totalHours-40, 0)
            }
        }

        function convertToMinutes(militaryTime) {
            var x = militaryTime.toString();
            var subHours = x.substr(0, 2);
            var subMinutes = x.substr(2, 2);
            var hour = parseInt(subHours);
            var minutes = parseInt(subMinutes);
            return (hour*60) + (minutes);
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
            console.log($scope.startTime + ' ' + createMilitaryTime($scope.startTime));
            console.log($scope.endTime + ' ' + createMilitaryTime($scope.endTime));

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