/**
 * tequila
 * interface-test
 */
test.runnerInterface = function () {
  test.heading('Interface Class', function () {
    test.paragraph('The Interface Class is an abstraction of a user interface.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Interface', true, function () {
        return new Interface() instanceof Interface;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Interface();
      });
      test.example('should make sure argument properties are valid', Error('error creating Procedure: invalid property: yo'), function () {
        new Interface({yo: 'whatup'});
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('name', function () {
        test.example('defaults to (unnamed)', '(unnamed)', function () {
          return new Interface().name;
        });
      });
      test.heading('description', function () {
        test.example('defaults to a Interface', 'a Interface', function () {
          return new Interface().description;
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the message', 'Punched Card Interface', function () {
          return new Interface({description: 'Punched Card Interface'}).toString();
        });
      });
      test.heading('getValidationErrors()', function () {
        test.example('returns null when no errors', null, function () {
          return new Interface().getValidationErrors();
        });
      });
      test.heading('requestResponse({request:object}, callback', function () {
        test.paragraph('Subclasses of Interface will use this to submit user (or agent) initiated requests.  ' +
          'It can also be used by the app to push objects to the interface by passing {request:this...');
        test.example('arguments must be in correct format', test.asyncResponse(Error('invalid request: null')), function (testNode, returnResponse) {
          test.shouldThrow(Error('requestResponse arguments required: object, callback'), function () {
            new Interface().requestResponse();
          });
          test.shouldThrow(Error('requestResponse arguments required: object, callback'), function () {
            new Interface().requestResponse({}); // missing callback
          });
          test.shouldThrow(Error('requestResponse arguments required: object, callback'), function () {
            new Interface().requestResponse("hello", function () {
              // function part ok but not passing an object
            });
          });
          test.shouldThrow(Error('requestResponse object has no request property'), function () {
            new Interface().requestResponse({}, function () {
              // function part ok but not passing an object
            });
          });
          // Any value can be set to request will be accepted on function call.
          // If the value is not handled then the callback receives an error as the response.
          // null should always return an error.
          new Interface().requestResponse({request:null}, function (obj) {
            returnResponse(testNode, obj.response);
          });
        });
      });
      test.heading('canMockResponses()', function () {
        test.example('see if mock responses allowed before testing', test.asyncResponse('mock check done'), function (testNode, returnResponse) {
          var ui = new Interface();
          if (ui.canMockResponses()) {
            throw new Error('no test for mock');
          } else {
            test.shouldThrow(Error('mockResponse not available for Interface'), function () {
              new Interface().requestResponse({request:null, mockResponse:null}, function (obj) {
                returnResponse(testNode, 'mock check failed');
              });
            });
            returnResponse(testNode, 'mock check done');
          }
        });
      });
    });
  });
};