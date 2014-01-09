/**
 * tequila
 * workspace-test
 */
test.runnerWorkspace = function () {
  test.heading('Workspace Model', function () {
    test.paragraph('A workspace is a collection of active deltas for a user.  The GUI could represent that as open' +
      'tabs for instance.  Each tab a model view.  The deltas represent the change in model state');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Workspace', true, function () {
        return new Workspace() instanceof Workspace;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(Workspace, true);
      });
    });
    test.heading('ATTRIBUTES', function () {
      test.example('following attributes are defined:', undefined, function () {
        var user = new Workspace(); // default attributes and values
        test.assertion(user.get('id') !== undefined);
        test.assertion(user.get('user') instanceof Attribute.ModelID);
        test.assertion(user.get('user').modelType == 'User');
        test.assertion(typeof user.get('deltas') == 'object');
      });
    });
    test.heading('METHODS', function () {
      test.paragraph('loadUserWorkspace(user, callBack)');
      test.paragraph('sync');
    });

    test.heading('INTEGRATION', function () {
      test.example('Workspace usage', undefined, function () {
      });

    });

  });
};