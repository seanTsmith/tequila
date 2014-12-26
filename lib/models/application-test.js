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
      test.heading('setAppPresentation(presentation)', function () {
        test.paragraph('Setting the presentation for the application determines the primary commands available to the user.');
        test.example('must supply Presentation object', Error('instance of Presentation a required parameter'), function () {
          new Application().setAppPresentation();
        });
      });
      test.heading('getAppPresentation()', function () {
        test.paragraph('returns primary user presentation for application');
        test.example('default is undefined', true, function () {
          return new Application().getAppPresentation() == undefined;
        });
        test.example('returns value set by set Presentation', true, function () {
          var myPresentation = new Presentation();
          var myApplication = new Application();
          myApplication.setAppPresentation(myPresentation);
          return (myApplication.getAppPresentation() === myPresentation);
        });
      });
      test.heading('setToolbarPresentation(presentation)', function () {
        test.paragraph('Setting the presentation for the application determines the primary commands available to the user.');
        test.example('must supply Presentation object', Error('instance of Presentation a required parameter'), function () {
          new Application().setToolbarPresentation();
        });
      });
      test.heading('getToolbarPresentation()', function () {
        test.paragraph('returns primary user presentation for application');
        test.example('default is undefined', true, function () {
          return new Application().getToolbarPresentation() == undefined;
        });
        test.example('returns value set by set Presentation', true, function () {
          var myPresentation = new Presentation();
          var myApplication = new Application();
          myApplication.setToolbarPresentation(myPresentation);
          return (myApplication.getToolbarPresentation() === myPresentation);
        });
      });
      test.heading('start()', function () {
        test.paragraph('The start method executes the application.');
        test.example('must set interface before starting', Error('error starting application: interface not set'), function () {
          new Application().start();
        });
        test.example('must set appPresentation before starting', Error('error starting application: appPresentation not set'), function () {
          var i = new Interface();
          var a = new Application();
          a.setInterface(i);
          a.start();
        });
        test.example('must set toolbarPresentation before starting', Error('error starting application: toolbarPresentation not set'), function () {
          var i = new Interface();
          var p = new Presentation();
          var a = new Application();
          a.setInterface(i);
          a.setAppPresentation(p);
          a.start();
        });
        test.example('callback parameter required', Error('callBack required'), function () {
          var i = new Interface();
          var p = new Presentation();
          var p2 = new Presentation();
          var a = new Application();
          a.setInterface(i);
          a.setAppPresentation(p);
          a.setToolbarPresentation(p2);
          a.start();
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
