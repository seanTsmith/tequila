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
      test.heading('start()', function () {
        test.paragraph('The start method executes the application.');
        test.example('must set interface before starting', Error('error starting application: interface not set'), function () {
          new Application().start();
        });
        test.example('callback parameter required', Error('callback required'), function () {
          var i = new Interface();
          var a = new Application();
          a.setInterface(i);
          a.start();
        });

      });
    });
  });
};
