/**
 * tequila
 * user-test
 */
test.runnerUserModel = function () {
  test.heading('User Model', function () {
    test.paragraph('The User Model represents the user logged into the system. The library uses this for system' +
      ' access, logging and other functions.');
    test.heading('CONSTRUCTOR', function () {
      test.example('objects created should be an instance of User', true, function () {
        return new User() instanceof User;
      });
      test.heading('Model tests are applied', function () {
        test.runnerModel(User, true);
      });
    });
    test.heading('ATTRIBUTES', function () {
      test.example('following attributes are defined:', undefined, function () {
        var user = new User(); // default attributes and values
        test.assertion(user.get('id') === null);
        test.assertion(user.get('name') === null);
        test.assertion(user.get('active') === false);
        test.assertion(user.get('password') === null);
        test.assertion(user.get('firstName') === null);
        test.assertion(user.get('lastName') === null);
        test.assertion(user.get('email') === null);
      });
    });
  });
};
