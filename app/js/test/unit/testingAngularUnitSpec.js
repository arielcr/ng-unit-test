describe('Testing AngularJS Test Suite => ', function() {

    // Inject the app module that we are testing
    beforeEach(module('testingAngularApp'));

    describe('Testing AngularJS Controller => ', function() {

        // Global variables to the controller
        var scope, ctrl, httpBackend, timeout, rootScope;

        // Inject the controller, scope and any other services and assign them to global variables
        beforeEach(inject(function($controller, $rootScope, $httpBackend, $timeout){
            rootScope = $rootScope;
            scope = $rootScope.$new();
            ctrl = $controller('testingAngularCtrl', {$scope:scope});
            httpBackend = $httpBackend;
            timeout = $timeout;
        }));

        // Cleanup code
        afterEach(function(){
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        // This is a test
        it('should initialize the title in the scope', function() {
            expect(scope.title).toBeDefined();
            expect(scope.title).toBe('Testing AngularJS Applications');
        });

        it('should add 2 destinations to the destinations list', function() {
            expect(scope.destinations).toBeDefined();
            expect(scope.destinations.length).toBe(0);

            scope.newDestination = {
                city: "Cartago",
                country: "Costa Rica"
            };

            scope.addDestination();

            expect(scope.destinations.length).toBe(1);
            expect(scope.destinations[0].city).toBe("Cartago");
            expect(scope.destinations[0].country).toBe("Costa Rica");

            scope.newDestination.city = "Phoenix";
            scope.newDestination.country = "USA";

            scope.addDestination();

            expect(scope.destinations.length).toBe(2);
            expect(scope.destinations[1].city).toBe("Phoenix");
            expect(scope.destinations[1].country).toBe("USA");

            expect(scope.destinations[0].city).toBe("Cartago");
            expect(scope.destinations[0].country).toBe("Costa Rica");
        });

        it('should remove a destination from the destinations list', function() {
            scope.destinations = [
                {
                    city: "Paris",
                    country: "France"
                },
                {
                    city: "Warsaw",
                    country: "Poland"
                }
            ];

            expect(scope.destinations.length).toBe(2);

            scope.removeDestination(0);

            expect(scope.destinations.length).toBe(1);
            expect(scope.destinations[0].city).toBe("Warsaw");
            expect(scope.destinations[0].country).toBe("Poland");
        });

        it('should remove error message after a fixed period of time', function(){
            rootScope.message = "Error";
            expect(rootScope.message).toBe("Error");

            // Needs this to complete the digest cycle
            rootScope.$apply();

            // Also this to end any pending process
            timeout.flush();

            expect(rootScope.message).toBeNull();
        });

    });

    // No need to test this service since it's mocked on the directive
    /*describe('Testing AngularJS Service => ', function(){

        it('should return celsius temperature from kelvin', inject(function(helperService){
            var temp = 290;

            var tempInCelsius = helperService.convertKelvinToCelsius(temp);

            expect(tempInCelsius).toBe(17);
        }));

    });*/

    describe('Testing AngularJS Filter => ', function(){

        it('should return only warm destinations', inject(function($filter){
            var warmest = $filter('warmestDestinations');

            var destinations = [
                {
                    city: "Beijing",
                    country: "China",
                    weather: {
                        temp: 21
                    }
                },
                {
                    city: "Moscow",
                    country: "Russia"          
                },
                {
                    city: "Mexico City",
                    country: "Mexico",
                    weather: {
                        temp: 12
                    }
                },
                {
                    city: "Lima",
                    country: "Peru",
                    weather: {
                        temp: 15
                    }
                }
            ];

            expect(destinations.length).toBe(4);

            var warmDestinations = warmest(destinations, 15);

            expect(warmDestinations.length).toBe(2);
            expect(warmDestinations[0].city).toBe("Beijing");
            expect(warmDestinations[1].city).toBe("Lima");

        }));
    });

    describe('Testing AngularJS Directive', function(){

        var scope, template, httpBackend, isolateScope, rootScope;

        // Mock the helper service using $provide, so we'll use this function instead of the one on the service
        beforeEach(function(){
            module(function($provide){
                var MockedHelperService = {
                    convertKelvinToCelsius: function(temp){
                        return Math.round(temp - 273);
                    }
                };

                $provide.value('helperService', MockedHelperService); 
            });
        });

        beforeEach(inject(function($compile, $rootScope, $httpBackend, _helperService_){
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
            rootScope = $rootScope;
            helperService = _helperService_;

            scope.destination = {
                city: "Tokyo",
                country: "Japan"
            };

            scope.apiKey = "xyz";

            var element = angular.element(
                '<div destination-directive destination="destination" api-key="apiKey" on-remove="remove()"></div>'
            );

            // Compile the template into JS
            template = $compile(element)(scope);
            scope.$digest();

            // Get the directive isolate scope to access the methods
            isolateScope = element.isolateScope();
        }));

        it('should update the weather for the specific destination', function() {

            // This tells karma and jasmine to just execute the function as it normally would by delegating to it actual code
            // spyOn(helperService, 'convertKelvinToCelsius').and.callThrough();

            // Mocks the return value
            // spyOn(helperService, 'convertKelvinToCelsius').and.returnValue(15);

            // Mocks the entire function in a more granular way (can use spies or $provide to mock any dependencies)
            spyOn(helperService, 'convertKelvinToCelsius').and.callFake(function(temp){
                return temp - 273;
            });

            scope.destination = {
                city: "Cartago",
                country: "Costa Rica"
            };

            // Mock the http call to simulate the request and attach a response
            httpBackend.expectGET("http://api.openweathermap.org/data/2.5/weather?q="+scope.destination.city+"&appid="+scope.apiKey).respond(
                {
                    weather: [{main: 'Rain', detail: 'Light rain'}],
                    main: {temp: 288}
                });

            // Access getWeather method throught isolateScope
            isolateScope.getWeather(scope.destination);

            // End any http request
            httpBackend.flush();

            expect(scope.destination.weather.main).toBe("Rain");
            expect(scope.destination.weather.temp).toBe(15);
            expect(helperService.convertKelvinToCelsius).toHaveBeenCalledWith(288);

        });

        it('should add a message if no city is found', function() {
            scope.destination = {
                city: "Cartago",
                country: "Costa Rica"
            };

            // Mock the http call to simulate the request and attach a response
            httpBackend.expectGET("http://api.openweathermap.org/data/2.5/weather?q="+scope.destination.city+"&appid="+scope.apiKey).respond(
                { }
            );

            // Access getWeather method throught isolateScope
            isolateScope.getWeather(scope.destination);

            // End any http request
            httpBackend.flush();

            expect(rootScope.message).toBe("City not found");

        });

        it('should add a message when there is a server error', function() {

            // Checks if a function have been called
            spyOn(rootScope, '$broadcast');
            
            scope.destination = {
                city: "Cartago",
                country: "Costa Rica"
            };

            // Mock the http call to simulate the request and attach a response
            httpBackend.expectGET("http://api.openweathermap.org/data/2.5/weather?q="+scope.destination.city+"&appid="+scope.apiKey).respond(500);

            // Access getWeather method throught isolateScope
            isolateScope.getWeather(scope.destination);

            // End any http request
            httpBackend.flush();

            expect(rootScope.message).toBe("Server Error");
            
            // Check if the spy captured a function call (in the parameter just include the function name)
            expect(rootScope.$broadcast).toHaveBeenCalled();
            expect(rootScope.$broadcast).toHaveBeenCalledWith('messageUpdated', { type: 'error', message: 'Server error' }); 
            expect(rootScope.$broadcast.calls.count()).toBe(1);

        });

        it('should call the parent controller remove function', function(){
            scope.removeTest = 1;

            // Mock the remove function
            scope.remove = function(){
                scope.removeTest++;
            };

            isolateScope.onRemove();

            expect(scope.removeTest).toBe(2);
        }); 
 
        it('should generate the correct HTML', function(){
            var templateAsHtml = template.html();

            expect(templateAsHtml).toContain('Tokyo, Japan');

            scope.destination.city = "London";
            scope.destination.country = "England";

            // Run the digest cycle and generate the template again
            scope.$digest();
            templateAsHtml = template.html();

            expect(templateAsHtml).toContain('London, England');

        });

    });

});
