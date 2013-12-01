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

// Tests for all interface subclasses
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
    test.heading('render()', function () {
      test.example('first argument must be a Presentation instance', Error('Presentation object required'), function () {
        new SurrogateInterface().render();
      });

      test.example('optional callback must be function', Error('optional second argument must a commandRequest callback function'), function () {
        new SurrogateInterface().render(new Presentation, true);
      });
    });
    test.heading('canMockResponses()', function () {
      test.example('see if mock responses allowed before testing', test.asyncResponse('mock check done'), function (testNode, returnResponse) {
        var ui = new SurrogateInterface();
        if (ui.canMockResponses()) {
          throw new Error('no test for mock');
        } else {
          test.shouldThrow(Error('mockResponse not available for Interface'), function () {
            new SurrogateInterface().render(new Presentation, function () {
              returnResponse(testNode, 'mock check failed');
            }, true);
          });
          returnResponse(testNode, 'mock check done');
        }
      });
    });
  });
};