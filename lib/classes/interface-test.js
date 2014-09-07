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
test.runnerInterfaceMethodsTest = function (SurrogateInterface, inheritanceTest) {
  var inheritanceTestWas = T.inheritanceTest;
  T.inheritanceTest = inheritanceTest;
  test.heading('Interface Class', function () {
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of SurrogateInterface', true, function () {
        var i = new SurrogateInterface();
        return (i instanceof SurrogateInterface) && (i instanceof Interface);
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
      test.heading('start()', function () {
        test.paragraph('The start method initiates the interface and passes a callback for the interface to submit requests. ' +
          'The callback must pass a Request object followed by an optional callback for responses to the request e.g. ' +
          'interface.start ( function ( request, response(callback) ) ) {}');
        test.example('Application parameter is required', Error('Application required'), function () {
          new SurrogateInterface().start();
        });
        test.example('presentation parameter is required', Error('presentation required'), function () {
          new SurrogateInterface().start(new Application());
        });
        test.example('callback parameter required', Error('callBack required'), function () {
          new SurrogateInterface().start(new Application(), new Presentation());
        });
      });
      test.heading('stop()', function () {
        test.paragraph('calling stop will end the start() processing and release any resources');
        test.example('must pass callback function', Error('callBack required'), function () {
          new SurrogateInterface().stop();
        });
      });
      test.heading('dispatch()', function () {
        test.paragraph('The dispatch method will accept a request and act on it or pass it to the app.');
        test.example('must pass a Request object', Error('Request required'), function () {
          new SurrogateInterface().dispatch();
        });
        test.example('send command without callback when no response needed', undefined, function () {
          new SurrogateInterface().dispatch(new Request({type: 'Command', command: new Command()}));
        });
        test.example('optional second parameter is the response callback', Error('response callback is not a function'), function () {
          new SurrogateInterface().dispatch(new Request({type: 'Command', command: new Command()}), true);
        });
      });
      test.heading('notify()', function () {
        test.paragraph('The notify method sends a Request to the Interface.  This can be the result of a request sent from the start() callback.');
        test.example('must pass a Request object', Error('Request required'), function () {
          new SurrogateInterface().notify();
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
      test.heading('canMock()', function () {
        test.example('returns boolean to indicate if interface has mocking ability', 'boolean', function () {
          var canMock = new SurrogateInterface().canMock();
          return typeof canMock;
        });
      });
      test.heading('mockRequest()', function () {
        test.example('parameter must be request or array of requests', undefined, function () {
          var ui = new SurrogateInterface();
          test.shouldThrow('Error: missing request parameter', function () {
            ui.mockRequest();
          });
          // Empty Stub Commands are ignored in mocks
          ui.mockRequest(new Request(new Command())); // Send single command
          ui.mockRequest([new Request(new Command()), new Request(new Command())]); // Send array of commands
          // Test when one of array elements is bad
          test.shouldThrow('Error: invalid request parameter', function () {
            ui.mockRequest([new Request(new Command()), 'wtf']);
          });
        });
      });
    });
    test.runnerInterfaceIntegration();
  });
  T.inheritanceTest = inheritanceTestWas;
};