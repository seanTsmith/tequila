/**
 * tequila
 * user-test
 */
test.runnerUserModel = function () {
  test.heading('User', function () {
    test.paragraph('The User Model represents the user logged into the system. The library uses this for system' +
      'access, logging and other functions.');
    test.example('objects created should be an instance of User', true, function () {
      return new User() instanceof User;
    });
    test.heading('Model tests are applied', function () {
      test.runnerModel(User,true);
    });
  });
};
