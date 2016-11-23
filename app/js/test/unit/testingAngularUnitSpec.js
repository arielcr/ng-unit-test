describe('Testing AngularJS Test Suite', function() {

    // Inject the app module that we are testing
    beforeEach(module('testingAngularApp'));

    describe('Testing AngularJS Controller', function() {

        var scope, ctrl;

        // Inject the controller and scope and assign them to global variables
        beforeEach(inject(function($controller, $rootScope){
            scope = $rootScope.$new();
            ctrl = $controller('testingAngularCtrl', {$scope:scope});
        }));

        afterEach(function(){
            // Cleanup code

        });

        // This is a test
        it('should initialize the title in the scope', function() {

            expect(scope.title).toBeDefined();
            expect(scope.title).toBe('Testing AngularJS Applications');

        });

    });

});
