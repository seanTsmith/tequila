/**
 * tequila
 * application-test
 */
test.runnerApplicationModel = function () {
  test.heading('Application Model', function () {
    test.paragraph('Information about the application is modeled here.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of User', true, function () {
        return new Application() instanceof Application;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Application,true);
      });
    });
  });
};
