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
        test.runnerModel(Application,true);
      });
    });
    test.heading('METHODS', function () {
      test.heading('run', function () {
        test.paragraph('The run method executes the application.');
        test.example('with no parameters default command will be executed', Error('command not implemented'), function () {
          new Application().run();
        });
      });
    });
  });
};
