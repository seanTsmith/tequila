/**
 * tequila
 * application-test
 */
test.runnerApplicationModel = function () {
  test.heading('Application Model', function () {
    test.paragraph('Information about the application is modeled here.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Application', true, function () {
        return new Application() instanceof Application;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Application, true);
      });
    });
    test.heading('ATTRIBUTES', function () {
      test.paragraph('Application extends model and inherits the attributes property.  All Presentation objects ' +
        'have the following attributes:');
      test.example('following attributes are defined:', undefined, function () {
        var presentation = new Application(); // default attributes and values
        test.assertion(presentation.get('name') === 'newApp');
        test.assertion(presentation.get('brand') === 'NEW APP');
      });

    });
    test.heading('METHODS', function () {
      test.heading('setInterface(interface)', function () {
        test.paragraph('Setting the interface for the application determines the primary method of user interaction.');
        test.example('must supply Interface object', Error('instance of Interface a required parameter'), function () {
          new Application().setInterface();
        });
      });
      test.heading('getInterface()', function () {
        test.paragraph('returns primary user interface for application');
        test.example('default is undefined', true, function () {
          return new Application().getInterface() == undefined;
        });
        test.example('returns value set by set Interface', true, function () {
          var myInterface = new Interface();
          var myApplication = new Application();
          myApplication.setInterface(myInterface);
          return (myApplication.getInterface() === myInterface);
        });
      });
      test.heading('setPresentation(presentation)', function () {
        test.paragraph('Setting the presentation for the application determines the primary commands available to the user.');
        test.example('must supply Presentation object', Error('instance of Presentation a required parameter'), function () {
          new Application().setPresentation();
        });
      });
      test.heading('getPresentation()', function () {
        test.paragraph('returns primary user presentation for application');
        test.example('default is undefined', true, function () {
          return new Application().getPresentation() == undefined;
        });
        test.example('returns value set by set Presentation', true, function () {
          var myPresentation = new Presentation();
          var myApplication = new Application();
          myApplication.setPresentation(myPresentation);
          return (myApplication.getPresentation() === myPresentation);
        });
      });
      test.heading('start()', function () {
        test.paragraph('The start method executes the application.');
        test.example('must set interface before starting', Error('error starting application: interface not set'), function () {
          new Application().start();
        });
        test.example('callback parameter required', Error('callBack required'), function () {
          var app = new Application();
          app.setInterface(new Interface());
          app.start();
        });
      });
      test.heading('dispatch()', function () {
        test.paragraph('The dispatch method will accept a request and act on it or pass it to the app.');
        test.example('must pass a Request object', Error('Request required'), function () {
          new Application().dispatch();
        });
        test.example('send command without callback when no response needed', undefined, function () {
          new Application().dispatch(new Request({type: 'Command', command: new Command()}));
        });
        test.example('optional second parameter is the response callback', Error('response callback is not a function'), function () {
          new Application().dispatch(new Request({type: 'Command', command: new Command()}), true);
        });
      });
    });
    test.runnerApplicationIntegration();
  });
};
