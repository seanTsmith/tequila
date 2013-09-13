/**
 * tequila
 * interface-test
 */
test.runnerInterface = function () {
  test.heading('Interface Class', function () {
    test.paragraph('The Interface Class is an abstraction of a user interface.');
    test.runnerInterfaceMethodsTest(Interface);
  });
};
test.runnerInterfaceMethodsTest = function (SurrogateInterface) {
  test.heading('CONSTRUCTOR', function () {
    test.example('objects created should be an instance of SurrogateInterface', true, function () {
      return new SurrogateInterface() instanceof SurrogateInterface;
    });
    test.example('should make sure new operator used', Error('new operator required'), function () {
      SurrogateInterface();
    });
    test.example('should make sure argument properties are valid', Error('error creating Procedure: invalid property: yo'), function () {
      new SurrogateInterface({yo: 'whatup'});
    });
  });
  test.heading('PROPERTIES', function () {
    test.heading('name', function () {
      test.example('defaults to (unnamed)', '(unnamed)', function () {
        return new SurrogateInterface().name;
      });
    });
    test.heading('description', function () {
      test.example('defaults to a SurrogateInterface', 'a Interface', function () {
        return new SurrogateInterface().description;
      });
    });
  });
  test.heading('METHODS', function () {
    test.heading('toString()', function () {
      test.example('should return a description of the message', 'Punched Card SurrogateInterface', function () {
        return new SurrogateInterface({description: 'Punched Card SurrogateInterface'}).toString();
      });
    });
    test.heading('getValidationErrors()', function () {
      test.example('returns null when no errors', null, function () {
        return new SurrogateInterface().getValidationErrors();
      });
    });
    test.heading('requestResponse({request:object}, callback', function () {
      test.paragraph('Subclasses of SurrogateInterface will use this to submit user (or agent) initiated requests.  ' +
        'It can also be used by the app to push objects to the SurrogateInterface by passing {request:this...');
      test.example('arguments must be in correct format', test.asyncResponse(Error('invalid request: null')), function (testNode, returnResponse) {
        test.shouldThrow(Error('requestResponse arguments required: object, callback'), function () {
          new SurrogateInterface().requestResponse();
        });
        test.shouldThrow(Error('requestResponse arguments required: object, callback'), function () {
          new SurrogateInterface().requestResponse({}); // missing callback
        });
        test.shouldThrow(Error('requestResponse arguments required: object, callback'), function () {
          new SurrogateInterface().requestResponse("hello", function () {
            // function part ok but not passing an object
          });
        });
        test.shouldThrow(Error('requestResponse object has no request property'), function () {
          new SurrogateInterface().requestResponse({}, function () {
            // function part ok but not passing an object
          });
        });
        // Any value can be set to request will be accepted on function call.
        // If the value is not handled then the callback receives an error as the response.
        // null should always return an error.
        new SurrogateInterface().requestResponse({request: null}, function (obj) {
          returnResponse(testNode, obj.response);
        });
      });
    });
    test.heading('canMockResponses()', function () {
      test.example('see if mock responses allowed before testing', test.asyncResponse('mock check done'), function (testNode, returnResponse) {
        var ui = new SurrogateInterface();
        if (ui.canMockResponses()) {
          throw new Error('no test for mock');
        } else {
          test.shouldThrow(Error('mockResponse not available for Interface'), function () {
            new SurrogateInterface().requestResponse({request: null, mockResponse: null}, function (obj) {
              returnResponse(testNode, 'mock check failed');
            });
          });
          returnResponse(testNode, 'mock check done');
        }
      });
    });
  });
};