/**
 * tequila
 * workspace-test
 */
test.runnerWorkspace = function () {
  test.heading('Workspace Class', function () {
    test.paragraph('A workspace is a collection of active deltas for a user.  The GUI could represent that as open' +
      'tabs for instance.  Each tab a model view.  The deltas represent the change in model state');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of Workspace', true, function () {
        return new Workspace(new User()) instanceof Workspace;
      });
      test.example('should make sure new operator used', Error('new operator required'), function () {
        Workspace();
      });
      test.example('must pass user model in constructor', Error('user model required'), function () {
        new Workspace();
      });
    });
    test.heading('PROPERTIES', function () {
      test.heading('user - User Model who owns workspace', function () {
        test.example('value is a user model', undefined, function () {
          test.assertion(new Workspace(new User()).user instanceof User);
        });
      });
      test.heading('deltas - array of deltas active deltas for user', function () {
        test.example('value is array', undefined, function () {
          test.assertion(new Workspace(new User()).deltas instanceof Array);
        });
      });
    });
    test.heading('METHODS', function () {
      test.heading('toString()', function () {
        test.example('should return a description of the workspace', Error("error creating Attribute: multiple errors"), function () {
          return new Workspace(new User('todo')).toString(); // user with name would be nice (todo)
        });
      });
    });
  });
};