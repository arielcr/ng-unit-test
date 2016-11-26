var testingAngularApp = angular.module('testingAngularApp', []);


// Aoo controller
testingAngularApp.controller('testingAngularCtrl', function($rootScope, $scope, $http, $log, $timeout, helperService) {

    $scope.title = "Testing AngularJS Applications";

    $scope.destinations = [];

    $scope.apiKey = "fba96dd8b75cb80c55412f58297e7516";

    $scope.newDestination = {
        city: undefined,
        country: undefined
    };

    $scope.addDestination = function(){
        $scope.destinations.push({
            city: $scope.newDestination.city,
            country: $scope.newDestination.country
        });
    };

    $scope.removeDestination = function(index){
        $scope.destinations.splice(index, 1);
    };

    $scope.messageWatcher = $rootScope.$watch('message', function(){
        if($rootScope.message){
            $timeout(function(){
                $rootScope.message = null;
            }, 3000);
        }
    });

});


// Custom filter
testingAngularApp.filter('warmestDestinations', function() {
    return function(destinations, minimumTemp){
        var warmDestinations = [];

        angular.forEach(destinations, function(destination){
            if(destination.weather && destination.weather.temp && destination.weather.temp >= minimumTemp){
                warmDestinations.push(destination);
            }
        });

        return warmDestinations;
    };
});


// Custom service
testingAngularApp.service('helperService', function() {
    this.convertKelvinToCelsius = function(temp){
        return Math.round(temp - 273);
    };

    return this;
});


// Custom directive
testingAngularApp.directive('destinationDirective', function() {
    return {
        scope: {
            destination: '=',
            apiKey: '=',
            onRemove: '&'
        },
        template:
                '<span>{{destination.city}}, {{destination.country}}</span>' +
                '<span ng-if="destination.weather">' +
                '    - {{destination.weather.main}}, {{destination.weather.temp}}' +
                '</span>' +
                '<button ng-click="onRemove()">Remove</button>' +
                '<button ng-click="getWeather(destination)">Update Weather</button>',
        controller: function($http, $rootScope, $scope, helperService){

            $scope.getWeather = function(destination){
                $http.get("http://api.openweathermap.org/data/2.5/weather?q="+destination.city+"&appid="+$scope.apiKey).then(
                    function successCallback(response){
                        if(response.data.weather){
                            destination.weather = {};
                            destination.weather.main = response.data.weather[0].main;
                            destination.weather.temp = helperService.convertKelvinToCelsius(response.data.main.temp);
                        } else {
                            $rootScope.message = "City not found";
                        }
                    },
                    function errorCallback(error){
                        $rootScope.message = "Server Error";
                        $rootScope.$broadcast('messageUpdated', { type: 'error', message: 'Server error' });
                    }
                );
            };

        }

    };

});
