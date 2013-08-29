/**
 * tequila
 * workspace-test
 */
test.runnerWorkspace = function () {
  test.heading('Workspace Class', function () {
    test.paragraph('A workspace is a collection of active deltas for a user.  The GUI could represent that as open' +
      'tabs for instance.  Each tab a model view.  The deltas represent the change in model state');
    test.example('', undefined, function () {
      /* TODO

       PROPERTIES
       user - User Model who owns workspace
       deltas - array of deltas active deltas for user
       */
    });

  });
};